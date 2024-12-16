# --- Importation des modules
# sqlalchemy est utilisé pour la gestion de la base de données, cela permet de créer des modèles de données, de les manipuler, etc.
from sqlalchemy import create_engine
# sqlalchemy.ext.declarative est utilisé pour la déclaration de la base de données
from sqlalchemy.ext.declarative import declarative_base
# sqlalchemy.orm est utilisé pour la session de la base de données, cela permet d'accéder à la base de données, de la lire et de l'écrire, etc.
from sqlalchemy.orm import sessionmaker
# os est utilisé pour la gestion des variables d'environnement
import os
# dotenv est utilisé pour charger les variables d'environnement
from dotenv import load_dotenv
load_dotenv()

# --- Variables d'environnement
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")

# --- Connexion à la base de données
SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

# --- Création de la session de la base de données
engine = create_engine(SQLALCHEMY_DATABASE_URL) # création du moteur de la base de données
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # création de la session de la base de données
Base = declarative_base() # création de la base de données
