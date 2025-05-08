# --- Importation des modules
# -- Fast API
# datetime est utilisé pour la gestion des dates
from datetime import datetime
# typing.Annotated est utilisé pour la gestion des annotations
from typing import Annotated, List

import schemas
import services
import websocket
from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect, HTTPException
# CORS est utilisé pour la gestion des requêtes CORS
from fastapi.middleware.cors import CORSMiddleware
# OAuth2PasswordBearer est utilisé pour la gestion de l'authentification, OAuth2PasswordRequestForm est utilisé pour la gestion de la requête d'authentification
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from game_manager import GameManager
# --- SQLAlchemy
from sqlalchemy.orm import Session
from websocket_manager import WebsocketManager

# --- Catégories des endpoints (voir documentations Swagger/redocs)
tags_metadata = [
     {
        "name": "Server",
        "description": "Monitor the server state",
    },
    {
        "name": "Users",
        "description": "Operations with users. The **login** logic is also here.",
    },
    {
        "name": "Games",
        "description": "Operations with games. Save, update and view games.",
    },
]

# --- FastAPI app
app = FastAPI(
    title="Template API FastAPI",
    description="This is the API documentation for the Template API FastAPI",
)

# Migration de la base de données
services.create_database()

# Instance de la base de données
services.get_db()

# --- Configuration CORS
# Spécifier explicitement les origines autorisées pour résoudre les problèmes CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Origine du frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Créer une instance de OAuth2PasswordBearer avec l'URL personnalisée
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Routes
# --- Server
@app.get("/", tags=["Server"])
async def root():
    """
    Cette route permet de vérifier si le serveur est en ligne
    """
    return {"message": "NotaBene API is online, welcome to the API documentation at /docs or /redocs"}

@app.get("/unixTimes", tags=["Server"])
async def read_item():
    """
    Cette route permet de récupérer le temps UNIX
    """
    unix_timestamp = datetime.now().timestamp()
    return {"unixTime": unix_timestamp}

# --- Users
# On ne peut pas changer le nom de la route, c'est une route prédéfinie par FastAPI
@app.post("/token", response_model=schemas.Token, tags=["Users"])
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(services.get_db)
)-> schemas.Token:
    """
    @param form_data: OAuth2PasswordRequestForm
    @param db: Session
    @return schemas.Token
    """
    return await services.authenticate_user(db, form_data.username, form_data.password)

@app.get("/users/", response_model=list[schemas.User], tags=["Users"])
async def read_users(
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
)-> list[schemas.User]:
    """
    Cette route permet de récupérer tous les utilisateurs
    @param db: Session
    @return list[schemas.User]
    """
    return await services.get_all_users(db)

@app.post("/users/", response_model=schemas.User, tags=["Users"])
async def add_user(
    user: schemas.UserCreate,
    db: Session = Depends(services.get_db)
)-> schemas.User:
    """
    Cette route permet d'ajouter un utilisateur
    @param user: schemas.UserCreate
    @param db: Session
    @return schemas.User
    """
    return await services.add_user(db, user)

@app.get("/users/me/", response_model=schemas.User, tags=["Users"])
async def read_users_me(
    current_user: Annotated[schemas.User, Depends(services.get_current_user)]
):
    return current_user

# route pour rajoute +100 au élo d'un joueur et -100 au élo d'un autre joueur
@app.patch("/users/elo/{user_add}/{user_remove}", tags=["Users"])
async def update_elo(
    user_add: str,
    user_remove: str,
    db: Session = Depends(services.get_db)
):
    return await services.update_elo(db, user_add, user_remove)


websocket_manager = WebsocketManager()
@app.websocket("/messages/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Attend et reçoit les messages du client WebSocket
            data = await websocket.receive_text()
            print(f"Message reçu: {data}")
            # Diffuse le message à tous les clients connectés
            await websocket_manager.broadcast(f"Client a dit: {data}")
    except WebSocketDisconnect:
        print("Un client s'est déconnecté")
        await websocket_manager.disconnect(websocket)


game_manager = GameManager()
@app.websocket("/game/")
async def websocket_game_endpoint(websocket: WebSocket):
    try:
        # print ce que le client envoie
        # print(f"Client a dit: {await websocket.receive_text()}")
        await game_manager.add_player(websocket)
        while True:
            data = await websocket.receive_text()
            print(f"Message reçu: {data}")
            await game_manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        await game_manager.remove_player(websocket)

# --- Games
@app.post("/games/", response_model=schemas.Game, tags=["Games"])
async def create_game(
    game: schemas.GameCreate,
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
) -> schemas.Game:
    """
    Cette route permet de créer une nouvelle partie
    @param game: schemas.GameCreate
    @param current_user: schemas.User
    @param db: Session
    @return schemas.Game
    """
    return await services.save_game(db, game)

@app.post("/games/{game_id}/moves", response_model=schemas.Game, tags=["Games"])
async def add_move_to_game(
    game_id: int,
    move: schemas.GameAddMove,
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
) -> schemas.Game:
    """
    Cette route permet d'ajouter un mouvement à l'historique d'une partie
    @param game_id: int
    @param move: schemas.GameAddMove
    @param current_user: schemas.User
    @param db: Session
    @return schemas.Game
    """
    game = await services.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie non trouvée")
    
    # Vérifier que l'utilisateur est l'un des joueurs
    if current_user.id != game.player1_id and current_user.id != game.player2_id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier cette partie")
    
    return await services.add_move_to_game(db, game_id, move)

@app.get("/games/", response_model=List[schemas.Game], tags=["Games"])
async def read_games(
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(services.get_db)
) -> List[schemas.Game]:
    """
    Cette route permet de récupérer toutes les parties
    @param current_user: schemas.User
    @param skip: int
    @param limit: int
    @param db: Session
    @return List[schemas.Game]
    """
    return await services.get_all_games(db, skip, limit)

@app.get("/games/{game_id}", response_model=schemas.Game, tags=["Games"])
async def read_game(
    game_id: int,
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
) -> schemas.Game:
    """
    Cette route permet de récupérer une partie par son ID
    @param game_id: int
    @param current_user: schemas.User
    @param db: Session
    @return schemas.Game
    """
    game = await services.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie non trouvée")
    return game

@app.get("/games/user/{user_id}", response_model=List[schemas.Game], tags=["Games"])
async def read_user_games(
    user_id: int,
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
) -> List[schemas.Game]:
    """
    Cette route permet de récupérer toutes les parties d'un utilisateur
    @param user_id: int
    @param current_user: schemas.User
    @param db: Session
    @return List[schemas.Game]
    """
    return await services.get_user_games(db, user_id)

@app.put("/games/{game_id}", response_model=schemas.Game, tags=["Games"])
async def update_game_route(
    game_id: int,
    game_update: schemas.GameUpdate,
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
) -> schemas.Game:
    """
    Cette route permet de mettre à jour une partie
    @param game_id: int
    @param game_update: schemas.GameUpdate
    @param current_user: schemas.User
    @param db: Session
    @return schemas.Game
    """
    game = await services.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie non trouvée")
    
    # Vérifier que l'utilisateur est l'un des joueurs
    if current_user.id != game.player1_id and current_user.id != game.player2_id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier cette partie")
        
    return await services.update_game(db, game_id, game_update)

@app.delete("/games/{game_id}", tags=["Games"])
async def delete_game_route(
    game_id: int,
    current_user: Annotated[schemas.User, Depends(services.get_current_user)],
    db: Session = Depends(services.get_db)
):
    """
    Cette route permet de supprimer une partie
    @param game_id: int
    @param current_user: schemas.User
    @param db: Session
    @return: Message de confirmation
    """
    game = await services.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie non trouvée")
    
    # Vérifier que l'utilisateur est l'un des joueurs
    if current_user.id != game.player1_id and current_user.id != game.player2_id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à supprimer cette partie")
    
    success = await services.delete_game(db, game_id)
    if success:
        return {"message": "Partie supprimée avec succès"}
    raise HTTPException(status_code=500, detail="Erreur lors de la suppression de la partie")