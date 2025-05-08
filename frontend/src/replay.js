// filepath: /Users/antocreadev/Developer/M1DWM-game-of-life/frontend/src/replay.js
import { getGameById } from './services/savedGames.js';

// Classe pour gérer la grille de Conway
class ConwayGrid {
  constructor(gridSize = 20) {
    this.gridSize = gridSize;
    this.gridState = {
      player1: [],
      player2: []
    };
    this.initializeGrid();
  }

  initializeGrid() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    gridContainer.style.gap = '2px';
    gridContainer.style.width = '600px';
    gridContainer.style.height = '600px';
    gridContainer.style.margin = '10px auto';
    gridContainer.innerHTML = '';

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.width = '100%';
        cell.style.height = '100%';
        cell.style.border = '1px solid #333';
        cell.style.backgroundColor = '#000';
        cell.dataset.row = i;
        cell.dataset.col = j;
        gridContainer.appendChild(cell);
      }
    }
  }

  updateGrid(state) {
    // Réinitialiser toutes les cellules
    document.querySelectorAll('.cell').forEach(cell => {
      cell.style.backgroundColor = '#000';
    });

    // Mettre à jour les cellules du joueur 1
    if (state.player1) {
      state.player1.forEach(([row, col]) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.style.backgroundColor = '#92cc41'; // Vert pour player1
      });
    }

    // Mettre à jour les cellules du joueur 2
    if (state.player2) {
      state.player2.forEach(([row, col]) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.style.backgroundColor = '#e76e55'; // Rouge pour player2
      });
    }

    // Mettre à jour les compteurs
    document.getElementById('player1Count').textContent = state.player1 ? state.player1.length : 0;
    document.getElementById('player2Count').textContent = state.player2 ? state.player2.length : 0;
  }
}

// Classe ReplayManager pour gérer la lecture du replay
class ReplayManager {
  constructor() {
    this.game = null;
    this.grid = new ConwayGrid();
    this.currentMoveIndex = 0;
    this.isPlaying = false;
    this.playInterval = null;
    this.playbackSpeed = 1000; // 1 seconde par défaut
    this.players = { player1: null, player2: null, winner: null };
    
    this.initialize();
  }

  async initialize() {
    try {
      // Récupérer l'ID de la partie depuis l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get('game_id');
      
      if (!gameId) {
        alert('ID de partie manquant dans l\'URL');
        window.location.href = '/saved-games.html';
        return;
      }

      // Charger les données de la partie
      this.game = await getGameById(gameId);
      
      if (!this.game || !this.game.game_history) {
        alert('Cette partie ne contient pas d\'historique de replay');
        window.location.href = '/saved-games.html';
        return;
      }

      // Charger les informations des joueurs
      await this.loadPlayerInfo();
      
      // Initialiser l'interface
      this.setupUI();
      
      // Afficher les informations de la partie
      this.displayGameInfo();
      
      // Initialiser la grille avec l'état initial
      this.goToMove(0);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du replay:', error);
      alert('Erreur lors du chargement de la partie');
    }
  }

  async loadPlayerInfo() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login.html';
        return;
      }

      // Récupérer les informations de tous les utilisateurs
      const response = await fetch('http://localhost:8090/users/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      
      const users = await response.json();
      
      // Trouver les joueurs et le gagnant
      this.players.player1 = users.find(user => user.id === this.game.player1_id);
      this.players.player2 = users.find(user => user.id === this.game.player2_id);
      
      if (this.game.winner_id) {
        this.players.winner = users.find(user => user.id === this.game.winner_id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations des joueurs:', error);
    }
  }

  setupUI() {
    // Configuration des boutons de contrôle
    document.getElementById('playBtn').addEventListener('click', () => this.play());
    document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
    document.getElementById('stopBtn').addEventListener('click', () => this.stop());
    document.getElementById('prevBtn').addEventListener('click', () => this.previousMove());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextMove());
    
    // Configuration du slider
    const slider = document.getElementById('moveSlider');
    slider.max = this.game.game_history.length - 1;
    document.getElementById('totalMoves').textContent = this.game.game_history.length - 1;
    
    slider.addEventListener('input', (e) => {
      this.goToMove(parseInt(e.target.value));
    });
    
    // Configuration du sélecteur de vitesse
    document.getElementById('speedSelect').addEventListener('change', (e) => {
      this.playbackSpeed = parseInt(e.target.value);
      
      // Si la lecture est en cours, redémarrer l'intervalle avec la nouvelle vitesse
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });
  }

  displayGameInfo() {
    if (!this.game) return;
    
    // Afficher les informations de la partie
    const date = new Date(this.game.created_at);
    document.getElementById('gameDate').textContent = date.toLocaleString('fr-FR');
    document.getElementById('player1Name').textContent = this.players.player1 ? this.players.player1.username : 'Inconnu';
    document.getElementById('player2Name').textContent = this.players.player2 ? this.players.player2.username : 'Inconnu';
    document.getElementById('gameStatus').textContent = this.game.is_finished ? 'Terminée' : 'En cours';
    document.getElementById('gameWinner').textContent = this.players.winner ? this.players.winner.username : 'Aucun ou match nul';
    
    // Calculer la durée approximative de la partie
    const createdAt = new Date(this.game.created_at);
    const updatedAt = new Date(this.game.updated_at);
    const durationMs = updatedAt - createdAt;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    document.getElementById('gameDuration').textContent = `${minutes}m ${seconds}s`;
    
    // Mettre à jour les titres des joueurs
    document.getElementById('player1Title').textContent = this.players.player1 ? this.players.player1.username : 'Joueur 1';
    document.getElementById('player2Title').textContent = this.players.player2 ? this.players.player2.username : 'Joueur 2';
  }

  goToMove(index) {
    if (!this.game || !this.game.game_history || index < 0 || index >= this.game.game_history.length) {
      return;
    }
    
    this.currentMoveIndex = index;
    const move = this.game.game_history[index];
    
    // Mettre à jour l'UI
    document.getElementById('currentMove').textContent = index;
    document.getElementById('moveSlider').value = index;
    document.getElementById('turnNumber').textContent = move.turn;
    
    // Mettre à jour la grille en fonction du type d'action
    switch (move.action) {
      case 'initial_state':
        this.grid.updateGrid(move.data);
        break;
      case 'place_cell':
        // Pour un placement de cellule, reconstruire la grille jusqu'à ce mouvement
        this.rebuildStateToMove(index);
        break;
      case 'generation':
        // Pour une génération, utiliser l'état après génération
        this.grid.updateGrid(move.data.after);
        break;
      case 'start_generations':
        // Rien de particulier à faire ici, la grille sera mise à jour par les mouvements de génération
        break;
      default:
        console.warn(`Type d'action non géré: ${move.action}`);
    }
  }

  rebuildStateToMove(targetIndex) {
    // Partir de l'état initial
    let currentState = { player1: [], player2: [] };
    
    // Trouver l'état initial
    const initialStateIndex = this.game.game_history.findIndex(m => m.action === 'initial_state');
    if (initialStateIndex !== -1) {
      currentState = JSON.parse(JSON.stringify(this.game.game_history[initialStateIndex].data));
    }
    
    // Appliquer tous les mouvements jusqu'à l'index cible
    for (let i = initialStateIndex + 1; i <= targetIndex; i++) {
      const move = this.game.game_history[i];
      
      if (move.action === 'place_cell') {
        // Ajouter la cellule au joueur correspondant
        const playerKey = `player${move.player}`;
        const { row, col } = move.data;
        currentState[playerKey].push([row, col]);
      } else if (move.action === 'generation') {
        // Remplacer l'état par l'état après génération
        currentState = JSON.parse(JSON.stringify(move.data.after));
      }
    }
    
    // Mettre à jour la grille avec l'état reconstruit
    this.grid.updateGrid(currentState);
  }

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    document.getElementById('playBtn').disabled = true;
    
    this.playInterval = setInterval(() => {
      if (this.currentMoveIndex < this.game.game_history.length - 1) {
        this.nextMove();
      } else {
        this.pause();
      }
    }, this.playbackSpeed);
  }

  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    document.getElementById('playBtn').disabled = false;
    
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  }

  stop() {
    this.pause();
    this.goToMove(0);
  }

  nextMove() {
    if (this.currentMoveIndex < this.game.game_history.length - 1) {
      this.goToMove(this.currentMoveIndex + 1);
    }
  }

  previousMove() {
    if (this.currentMoveIndex > 0) {
      this.goToMove(this.currentMoveIndex - 1);
    }
  }
}

// Initialiser le gestionnaire de replay une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  const replayManager = new ReplayManager();
});