# --- Importation des modules
# sqlalchemy est utilisé pour la gestion de la base de données, cela permet de créer des modèles de données, de les manipuler, etc.
# sqlalchemy.ext.declarative est utilisé pour la déclaration de la base de données
from database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime

# sqlalchemy.orm est utilisé pour la session de la base de données, cela permet d'accéder à la base de données, de la lire et de l'écrire, etc.
from sqlalchemy.orm import relationship
from datetime import datetime


# --- User model
class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    elo = Column(Integer)
    password = Column(String)


# --- Game model
class Game(Base):
    __tablename__ = "Games"
    id = Column(Integer, primary_key=True, index=True)
    player1_id = Column(Integer, ForeignKey("Users.id"))
    player2_id = Column(Integer, ForeignKey("Users.id"))

    # Stocke l'historique complet des mouvements pour le replay
    game_history = Column(
        JSON
    )  # Array de {turn: int, player: int, action: string, data: any}

    # État final du jeu
    final_state = Column(JSON)  # Stocke l'état final du jeu en JSON

    winner_id = Column(
        Integer, ForeignKey("Users.id"), nullable=True
    )  # NULL si partie en cours ou nulle
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    is_finished = Column(Boolean, default=False)

    # Relations
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_id])
