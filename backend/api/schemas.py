# --- Importation des modules
# pydantic est utilisé pour la validation des données
from enum import Enum
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel


# --- Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None

# --- User schemas
class UserBase(BaseModel):
    username: str
    
# UserCreate est utilisé pour la création d'un utilisateur, il contient un champ password + les champs de UserBase
class UserCreate(UserBase):
    password: str

# User est utilisé pour la lecture d'un utilisateur, il contient un champ id + les champs de UserBase
class User(UserBase):
    id: int
    elo: int
    class Config:
        from_attributes = True

# --- Game schemas
class GameMoveBase(BaseModel):
    turn: int
    player: int
    action: str
    data: Dict[str, Any]

class GameBase(BaseModel):
    player1_id: int
    player2_id: int
    
class GameCreate(GameBase):
    game_history: List[Dict[str, Any]] = []
    final_state: Optional[Dict[str, Any]] = None

class GameUpdate(BaseModel):
    game_history: List[Dict[str, Any]]
    final_state: Optional[Dict[str, Any]] = None
    winner_id: Optional[int] = None
    is_finished: bool = False

class GameAddMove(BaseModel):
    move: Dict[str, Any]

class Game(GameBase):
    id: int
    game_history: List[Dict[str, Any]]
    final_state: Optional[Dict[str, Any]] = None
    winner_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_finished: bool
    
    class Config:
        from_attributes = True

class GameWithPlayers(Game):
    player1: User
    player2: User
    winner: Optional[User] = None

