# --- Importation des modules
# sqlalchemy est utilisé pour la gestion de la base de données, cela permet de créer des modèles de données, de les manipuler, etc.
# sqlalchemy.ext.declarative est utilisé pour la déclaration de la base de données
from database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
# sqlalchemy.orm est utilisé pour la session de la base de données, cela permet d'accéder à la base de données, de la lire et de l'écrire, etc.
from sqlalchemy.orm import relationship


# --- User model
class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    elo = Column(Integer)
    password = Column(String) 