# --- Importation des modules
# sqlalchemy.orm est utilisé pour la session de la base de données, cela permet d'accéder à la base de données, de la lire et de l'écrire, etc.
# os est utilisé pour la gestion des variables d'environnement
import os
# datetime est utilisé pour la gestion des dates
from datetime import datetime, timedelta, timezone

# dotenv est utilisé pour charger les variables d'environnement
from dotenv import load_dotenv
# fastapi.HTTPException est utilisé pour lever des exceptions HTTP
from fastapi import HTTPException, status
# jose.JWTError est utilisé pour gérer les erreurs liées au JWT, jose.jwt est utilisé pour la gestion des JWT
from jose import JWTError, jwt
# passlib.context est utilisé pour le hashage des mots de passe
from passlib.context import CryptContext
from sqlalchemy.orm import Session

load_dotenv()

# --- Variables d'environnement
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# --- variables de contexte
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# pwd_context est utilisé pour le hashage des mots de passe il utilise CryptContext de passlib.context qui permet de gérer les contextes de hashage de mot de passe et deprecated="auto" permet de gérer les anciens algorithmes de hashage de mot de passe automatiquement en les mettant à jour si nécessaire

# --- Fonctions de services
def verify_password(plain_password, hashed_password) -> bool:
    """
    Cette fonction permet de vérifier si un mot de passe est correct
    @param plain_password: str
    @param hashed_password: str
    @return bool
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password) -> str:
    """
    Cette fonction permet de hasher un mot de passe
    @param password: str
    @return str
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Cette fonction permet de créer un token d'accès
    @param data: dict
    @param expires_delta: timedelta
    @return str
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
