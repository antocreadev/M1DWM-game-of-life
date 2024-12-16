
# --- Importation des modules
# pydantic est utilisé pour la validation des données
from enum import Enum
from typing import List, Optional

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

