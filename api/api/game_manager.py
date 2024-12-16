import asyncio
import json
from typing import Dict, List

from fastapi import WebSocket


class GameManager:
    def __init__(self):
        self.active_games: Dict[str, List[WebSocket]] = {}
        self.waiting_players: List[WebSocket] = []
        self.game_states: Dict[str, Dict] = {}  # Pour stocker l'état de chaque partie

    async def add_player(self, websocket: WebSocket):
        await websocket.accept()
        self.waiting_players.append(websocket)
        
        if len(self.waiting_players) >= 2:
            player1 = self.waiting_players.pop(0)
            player2 = self.waiting_players.pop(0)
            
            game_id = f"game_{len(self.active_games) + 1}"
            self.active_games[game_id] = [player1, player2]
            self.game_states[game_id] = {
                "current_player": 1,
                "game_data": {"player1": [], "player2": []}
            }
            
            # Notifier les joueurs avec leur numéro
            await player1.send_text(json.dumps({
                "type": "game_start",
                "player_number": 1,
                "message": "Partie trouvée ! Vous êtes le joueur 1"
            }))
            await player2.send_text(json.dumps({
                "type": "game_start",
                "player_number": 2,
                "message": "Partie trouvée ! Vous êtes le joueur 2"
            }))
        else:
            await websocket.send_text(json.dumps({
                "type": "waiting",
                "message": "En attente d'un autre joueur..."
            }))

    async def remove_player(self, websocket: WebSocket):
        # Retirer le joueur de la file d'attente s'il y est
        if websocket in self.waiting_players:
            self.waiting_players.remove(websocket)
        
        # Retirer le joueur des parties actives et notifier l'autre joueur
        for game_id, players in self.active_games.items():
            if websocket in players:
                other_player = players[0] if players[1] == websocket else players[1]
                try:
                    await other_player.send_text("Votre adversaire s'est déconnecté")
                except:
                    pass  # L'autre joueur peut être déjà déconnecté
                del self.active_games[game_id]
                break

    async def handle_message(self, websocket: WebSocket, message: str):
        try:
            data = json.loads(message)
            # Trouver la partie du joueur
            for game_id, players in self.active_games.items():
                if websocket in players:
                    player_number = 1 if players[0] == websocket else 2
                    game_state = self.game_states[game_id]
                    
                    # Vérifier si c'est le tour du joueur
                    if game_state["current_player"] == player_number:
                        # Mettre à jour l'état du jeu
                        game_state["game_data"] = data
                        # Changer de joueur
                        game_state["current_player"] = 3 - player_number  # Alterne entre 1 et 2
                        
                        # Envoyer la mise à jour aux deux joueurs
                        response = {
                            "type": "game_update",
                            "game_data": data,
                            "current_player": game_state["current_player"]
                        }
                        await players[0].send_text(json.dumps(response))
                        await players[1].send_text(json.dumps(response))
                    break
        except json.JSONDecodeError:
            pass