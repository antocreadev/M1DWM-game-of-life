import asyncio
import json
from typing import Dict, List

from fastapi import WebSocket


class GameManager:
    def __init__(self):
        self.active_games: Dict[str, List[WebSocket]] = {}
        self.waiting_players: List[WebSocket] = []
        self.game_states: Dict[str, Dict] = {}  # Pour stocker l'état de chaque partie
        self.generation_states: Dict[str, Dict] = {}  # Pour stocker l'état des générations

    async def add_player(self, websocket: WebSocket):
        await websocket.accept()
        
        # Attendre de recevoir le username
        init_data = await websocket.receive_text()
        player_data = json.loads(init_data)
        username = player_data.get('username', 'Anonyme')
        
        self.waiting_players.append((websocket, username))
        
        if len(self.waiting_players) >= 2:
            player1, username1 = self.waiting_players.pop(0)
            player2, username2 = self.waiting_players.pop(0)
            
            game_id = f"game_{len(self.active_games) + 1}"
            self.active_games[game_id] = [player1, player2]
            self.game_states[game_id] = {
                "current_player": 1,
                "game_data": {"player1": [], "player2": []},
                "usernames": {
                    "player1": username1,
                    "player2": username2
                }
            }
            
            # Notifier les joueurs avec leur numéro et les usernames
            await player1.send_text(json.dumps({
                "type": "game_start",
                "player_number": 1,
                "message": f"Partie trouvée ! Vous êtes {username1}",
                "usernames": {
                    "player1": username1,
                    "player2": username2
                }
            }))
            await player2.send_text(json.dumps({
                "type": "game_start",
                "player_number": 2,
                "message": f"Partie trouvée ! Vous êtes {username2}",
                "usernames": {
                    "player1": username1,
                    "player2": username2
                }
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
            if message != "start_generations" and message != "finish_game":
                data = json.loads(message)
    
            for game_id, players in self.active_games.items():
                if websocket in players:
                    if message == "start_generations":
                        # envoie un message au joueur 1 et au joueur 2
                        await asyncio.gather(
                            players[0].send_text(json.dumps({"type": "start_generations"})),
                            players[1].send_text(json.dumps({"type": "start_generations"}))
                        )
                    if message == "finish_game":
                        await asyncio.gather(
                            players[0].send_text(json.dumps({"type": "finish_game"})),
                            players[1].send_text(json.dumps({"type": "finish_game"}))
                        )
                    if isinstance(data, dict) and "type" in data:
                        if data["type"] == "game_end":
                            # Envoyer les résultats aux deux joueurs
                            response = {
                                "type": "game_end",
                                "results": data["results"]
                            }
                            await asyncio.gather(
                                players[0].send_text(json.dumps(response)),
                                players[1].send_text(json.dumps(response))
                            )
                    # Trouver la partie du joueur
                    player_number = 1 if players[0] == websocket else 2
                    game_state = self.game_states[game_id]
                    
                    if isinstance(data, dict) and "type" in data and data["type"] == "move":
                        # Vérifier si c'est le tour du joueur
                        if game_state["current_player"] == player_number:
                            # Mettre à jour l'état du jeu
                            game_state["game_data"] = data["game_data"]
                            # Changer de joueur
                            game_state["current_player"] = 3 - player_number  # Alterne entre 1 et 2
                    else:
                        # C'est une mise à jour de génération, pas besoin de vérifier le tour
                        game_state["game_data"] = data

                    # Envoyer la mise à jour aux deux joueurs
                    response = {
                        "type": "game_update",
                        "game_data": game_state["game_data"],
                        "current_player": game_state["current_player"]
                    }
                    
                    # Envoyer aux deux joueurs
                    await asyncio.gather(
                        players[0].send_text(json.dumps(response)),
                        players[1].send_text(json.dumps(response))
                    )
                    break
                    
        except json.JSONDecodeError:
            print("Erreur de décodage JSON:", message)
            pass
        except Exception as e:
            print("Erreur lors du traitement du message:", str(e))
            pass