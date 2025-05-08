// filepath: /Users/antocreadev/Developer/M1DWM-game-of-life/frontend/src/savedGames.js
import { getUserGames, getGameById, deleteGame } from './services/savedGames.js';

// Vérifie si l'utilisateur est connecté
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = "/login";
}

// Variables globales
let currentUserId;
let games = [];

// Au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  // Récupère l'ID de l'utilisateur une fois que userMe.js l'a chargé
  const checkUserId = setInterval(() => {
    const userIdElement = document.getElementById('userId');
    if (userIdElement && userIdElement.textContent) {
      currentUserId = parseInt(userIdElement.textContent);
      clearInterval(checkUserId);
      loadSavedGames();
    }
  }, 100);

  // Configuration des événements pour les modals
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteConfirmModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteGame);
});

/**
 * Charge les parties sauvegardées de l'utilisateur
 */
async function loadSavedGames() {
  try {
    games = await getUserGames(currentUserId);
    displayGames(games);
  } catch (err) {
    console.error('Erreur lors du chargement des parties:', err);
    showNoGamesMessage();
  }
}

/**
 * Affiche les parties dans le tableau
 * @param {Array} games - Liste des parties
 */
function displayGames(games) {
  const tableBody = document.getElementById('gamesTableBody');
  const noGamesMessage = document.getElementById('noGames');
  const gamesTable = document.getElementById('gamesTable');

  if (!games || games.length === 0) {
    showNoGamesMessage();
    return;
  }

  noGamesMessage.classList.add('hidden');
  gamesTable.classList.remove('hidden');
  
  tableBody.innerHTML = '';
  
  games.forEach(game => {
    const row = document.createElement('tr');
    
    // Format de la date
    const date = new Date(game.created_at);
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
    
    // État de la partie
    const gameStatus = game.is_finished ? 'Terminée' : 'En cours';
    
    // Détermine le vainqueur
    let winner = '-';
    if (game.is_finished && game.winner_id) {
      winner = game.winner_id === game.player1_id ? 'Joueur 1' : 'Joueur 2';
    } else if (game.is_finished) {
      winner = 'Match nul';
    }
    
    // Structure de la ligne
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>Joueur 1</td>
      <td>Joueur 2</td>
      <td>${gameStatus}</td>
      <td>${winner}</td>
      <td>
        <div class="flex space-x-2">
          <button class="nes-btn is-primary view-game" data-game-id="${game.id}">Voir</button>
          <button class="nes-btn is-error delete-game" data-game-id="${game.id}">Supprimer</button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });

  // Ajoute les écouteurs d'événements pour les boutons
  document.querySelectorAll('.view-game').forEach(button => {
    button.addEventListener('click', () => viewGame(button.dataset.gameId));
  });
  
  document.querySelectorAll('.delete-game').forEach(button => {
    button.addEventListener('click', () => showDeleteConfirm(button.dataset.gameId));
  });
}

/**
 * Affiche le message indiquant qu'il n'y a pas de parties sauvegardées
 */
function showNoGamesMessage() {
  document.getElementById('noGames').classList.remove('hidden');
  document.getElementById('gamesTable').classList.add('hidden');
}

/**
 * Ouvre le modal de visualisation d'une partie
 * @param {number} gameId - ID de la partie à visualiser
 */
async function viewGame(gameId) {
  try {
    const game = await getGameById(gameId);
    
    console.log("Données de la partie récupérées:", game); // Pour le débogage
    
    const modal = document.getElementById('gameViewModal');
    const gameDetails = document.getElementById('gameDetails');
    const gridContainer = document.getElementById('gridContainer');
    
    // Affiche les détails de la partie
    const createdAt = new Date(game.created_at);
    gameDetails.innerHTML = `
      <p><strong>Date de création:</strong> ${createdAt.toLocaleString('fr-FR')}</p>
      <p><strong>État:</strong> ${game.is_finished ? 'Terminée' : 'En cours'}</p>
    `;
    
    // Création de la grille pour visualiser la partie
    gridContainer.innerHTML = '';
    const gridSize = 20; // Taille standard de la grille de Conway
    
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 20px)`;
    grid.style.gap = '1px';
    
    // Obtenir l'état final du jeu (utiliser final_state au lieu de game_state)
    const finalState = game.final_state || {};
    const player1Positions = finalState.player1 || [];
    const player2Positions = finalState.player2 || [];
    
    // Remplit la grille avec l'état du jeu
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement('div');
        cell.style.width = '20px';
        cell.style.height = '20px';
        cell.style.border = '1px solid #ccc';
        
        // Vérifie si la cellule appartient à un joueur
        const isPlayer1 = Array.isArray(player1Positions) && 
                         player1Positions.some(position => 
                           Array.isArray(position) && 
                           position.length === 2 && 
                           position[0] === i && 
                           position[1] === j);
                           
        const isPlayer2 = Array.isArray(player2Positions) && 
                         player2Positions.some(position => 
                           Array.isArray(position) && 
                           position.length === 2 && 
                           position[0] === i && 
                           position[1] === j);
        
        if (isPlayer1) {
          cell.classList.add('nes-btn', 'is-success');
          cell.style.padding = '0';
        } else if (isPlayer2) {
          cell.classList.add('nes-btn', 'is-error');
          cell.style.padding = '0';
        } else {
          cell.classList.add('nes-btn');
          cell.style.padding = '0';
        }
        
        grid.appendChild(cell);
      }
    }
    
    gridContainer.appendChild(grid);
    
    // Configure le bouton "Rejouer"
    const replayButton = document.getElementById('replayGameBtn');
    replayButton.href = `/replay.html?game_id=${gameId}`; // Mise à jour vers replay.html
    
    // Affiche le modal
    modal.style.display = 'flex';
  } catch (err) {
    console.error('Erreur lors de la récupération de la partie:', err);
    alert('Impossible de charger les détails de cette partie.');
  }
}

/**
 * Ferme le modal de visualisation
 */
function closeModal() {
  document.getElementById('gameViewModal').style.display = 'none';
}

// Variables pour la suppression
let gameIdToDelete = null;

/**
 * Affiche le modal de confirmation de suppression
 * @param {number} gameId - ID de la partie à supprimer
 */
function showDeleteConfirm(gameId) {
  gameIdToDelete = gameId;
  document.getElementById('deleteConfirmModal').style.display = 'flex';
}

/**
 * Ferme le modal de confirmation de suppression
 */
function closeDeleteConfirmModal() {
  document.getElementById('deleteConfirmModal').style.display = 'none';
  gameIdToDelete = null;
}

/**
 * Confirme la suppression d'une partie
 */
async function confirmDeleteGame() {
  if (!gameIdToDelete) return;
  
  try {
    await deleteGame(gameIdToDelete);
    
    // Ferme le modal de confirmation
    closeDeleteConfirmModal();
    
    // Recharge la liste des parties
    loadSavedGames();
    
    // Affiche un message de succès
    alert('Partie supprimée avec succès !');
  } catch (err) {
    console.error('Erreur lors de la suppression de la partie:', err);
    alert('Erreur lors de la suppression de la partie.');
  }
}