# --- Importation des modules
# sqlalchemy.orm est utilisé pour la session de la base de données, cela permet d'accéder à la base de données, de la lire et de l'écrire, etc.
import random
# typing.Annotated est utilisé pour les annotations
from typing import Annotated, List, Optional

import database
import models
import schemas
import tasks
# fastapi.HTTPException est utilisé pour lever des exceptions HTTP
from fastapi import Depends, HTTPException, status
# OAuth2PasswordBearer est utilisé pour la gestion de l'authentification
from fastapi.security import OAuth2PasswordBearer
# jose.JWTError est utilisé pour gérer les erreurs liées au JWT, jose.jwt est utilisé pour la gestion des JWT
from jose import JWTError
from sqlalchemy.orm import Session

# --- Configuration de l'authentification
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Fonctions de services
def create_database():
    """
    Cette fonction permet de créer la base de données
    @return None
    """
    return database.Base.metadata.create_all(bind=database.engine)

def get_db() -> Session:
    """
    Cette fonction permet de récupérer la session de la base de données
    @return Session
    """
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Users
async def get_all_users(db: Session) -> list:
    """
    Cette fonction permet de récupérer tous les utilisateurs
    @param db: Session
    @return list
    """
    return db.query(models.User).all()

async def add_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Cette fonction permet d'ajouter un utilisateur
    @param db: Session
    @param user: schemas.UserCreate
    @return models.User
    """
    hashed_password = tasks.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        elo=1000,
        password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def authenticate_user(db: Session, username: str, password: str):
    """
    Cette fonction permet d'authentifier un utilisateur
    @param db: Session
    @param username: str
    @param password: str
    @return dict
    """
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not tasks.verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = tasks.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Cette fonction permet de récupérer l'utilisateur actuel
    @param db: Session
    @param token: str
    @return models.User
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = tasks.jwt.decode(token, tasks.SECRET_KEY, algorithms=[tasks.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user



async def update_elo(db: Session, user_add: str, user_remove: str):
    """
    Cette fonction permet de mettre à jour le élo d'un joueur
    @param db: Session
    @param user_add: str
    @param user_remove: str
    @return None
    """
    db.query(models.User).filter(models.User.username == user_add).update({"elo": models.User.elo + 100})
    db.query(models.User).filter(models.User.username == user_remove).update({"elo": models.User.elo - 100})
    db.commit()
    return {"message": "Elo updated successfully"}

# --- Games
async def save_game(db: Session, game: schemas.GameCreate) -> models.Game:
    """
    Cette fonction permet d'enregistrer une partie
    @param db: Session
    @param game: schemas.GameCreate
    @return models.Game
    """
    db_game = models.Game(**game.dict())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

async def update_game(db: Session, game_id: int, game_update: schemas.GameUpdate) -> models.Game:
    """
    Cette fonction permet de mettre à jour une partie
    @param db: Session
    @param game_id: int
    @param game_update: schemas.GameUpdate
    @return models.Game
    """
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Partie non trouvée")
    
    for key, value in game_update.dict().items():
        setattr(db_game, key, value)
    
    db.commit()
    db.refresh(db_game)
    return db_game

async def add_move_to_game(db: Session, game_id: int, move_data: schemas.GameAddMove) -> models.Game:
    """
    Cette fonction permet d'ajouter un mouvement à l'historique d'une partie
    @param db: Session
    @param game_id: int
    @param move_data: schemas.GameAddMove
    @return models.Game
    """
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Partie non trouvée")
    
    # Initialiser l'historique s'il est None
    if db_game.game_history is None:
        db_game.game_history = []
    
    # Ajouter le mouvement à l'historique
    db_game.game_history.append(move_data.move)
    
    db.commit()
    db.refresh(db_game)
    return db_game

async def get_game(db: Session, game_id: int) -> Optional[models.Game]:
    """
    Cette fonction permet de récupérer une partie par son ID
    @param db: Session
    @param game_id: int
    @return Optional[models.Game]
    """
    return db.query(models.Game).filter(models.Game.id == game_id).first()

async def get_user_games(db: Session, user_id: int) -> List[models.Game]:
    """
    Cette fonction permet de récupérer toutes les parties d'un utilisateur
    @param db: Session
    @param user_id: int
    @return List[models.Game]
    """
    return db.query(models.Game).filter(
        (models.Game.player1_id == user_id) | (models.Game.player2_id == user_id)
    ).all()

async def get_all_games(db: Session, skip: int = 0, limit: int = 100) -> List[models.Game]:
    """
    Cette fonction permet de récupérer toutes les parties
    @param db: Session
    @param skip: int
    @param limit: int
    @return List[models.Game]
    """
    return db.query(models.Game).offset(skip).limit(limit).all()

async def delete_game(db: Session, game_id: int) -> bool:
    """
    Supprime une partie par son ID
    @param db: Session
    @param game_id: int
    @return bool: True si la suppression a réussi, False sinon
    """
    try:
        game = db.query(models.Game).filter(models.Game.id == game_id).first()
        if not game:
            return False
            
        db.delete(game)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la suppression de la partie: {e}")
        return False
