// filepath: /Users/antocreadev/Developer/M1DWM-game-of-life/frontend/src/services/savedGames.js

/**
 * Service pour gérer les parties sauvegardées et leur historique
 */

const API_URL = "http://localhost:8090";

/**
 * Sauvegarde une partie avec son historique
 * @param {Object} gameData - Données de la partie à sauvegarder
 * @returns {Promise} - Promise avec les données de la partie sauvegardée
 */
export async function saveGame(gameData) {
  const token = localStorage.getItem("token");
  
  try {
    // Assurons-nous que game_history est un tableau
    if (!Array.isArray(gameData.game_history)) {
      gameData.game_history = [];
    }
    
    // Assurons-nous que final_state est un objet JSON valide
    if (gameData.final_state === undefined || gameData.final_state === null) {
      gameData.final_state = {};
    }
    
    // Log pour déboguer
    console.log("Envoi des données de partie:", JSON.stringify(gameData));
    
    const response = await fetch(`${API_URL}/games/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(gameData),
      // Ajouter credentials pour résoudre les problèmes CORS
      credentials: 'include'
    });
    
    // Log de la réponse pour déboguer
    const responseText = await response.text();
    console.log("Réponse brute:", responseText);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la sauvegarde de la partie: ${responseText}`);
    }
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return { id: 0, message: "Format de réponse non reconnu" };
    }
  } catch (err) {
    console.error("Erreur lors de la sauvegarde:", err);
    throw err;
  }
}

/**
 * Ajoute un mouvement à l'historique d'une partie existante
 * @param {number} gameId - ID de la partie
 * @param {Object} moveData - Données du mouvement à ajouter
 * @returns {Promise} - Promise avec les données de la partie mise à jour
 */
export async function addMoveToGame(gameId, moveData) {
  const token = localStorage.getItem("token");
  try {
    console.log(`Ajout du mouvement à la partie ${gameId}:`, JSON.stringify(moveData));
    
    const response = await fetch(`${API_URL}/games/${gameId}/moves`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ move: moveData }),
      credentials: 'include'
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout du mouvement: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return {};
    }
  } catch (err) {
    console.error("Erreur lors de l'ajout du mouvement:", err);
    throw err;
  }
}

/**
 * Met à jour une partie existante
 * @param {number} gameId - ID de la partie à mettre à jour
 * @param {Object} gameData - Nouvelles données de la partie
 * @returns {Promise} - Promise avec les données de la partie mise à jour
 */
export async function updateGame(gameId, gameData) {
  const token = localStorage.getItem("token");
  try {
    // Vérification du format des données
    if (!Array.isArray(gameData.game_history)) {
      gameData.game_history = [];
    }
    
    // Si final_state est null, le remplacer par un objet vide
    if (gameData.final_state === null || gameData.final_state === undefined) {
      gameData.final_state = {};
    }
    
    console.log(`Mise à jour de la partie ${gameId}:`, JSON.stringify(gameData));
    
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(gameData),
      credentials: 'include'
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return {};
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err);
    throw err;
  }
}

/**
 * Récupère une partie par son ID
 * @param {number} gameId - ID de la partie à récupérer
 * @returns {Promise} - Promise avec les données de la partie
 */
export async function getGameById(gameId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include'
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return {};
    }
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    throw err;
  }
}

/**
 * Récupère toutes les parties d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise} - Promise avec la liste des parties de l'utilisateur
 */
export async function getUserGames(userId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_URL}/games/user/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include'
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des parties: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return [];
    }
  } catch (err) {
    console.error("Erreur lors de la récupération des parties:", err);
    return [];
  }
}

/**
 * Supprime une partie par son ID
 * @param {number} gameId - ID de la partie à supprimer
 * @returns {Promise} - Promise avec le message de confirmation
 */
export async function deleteGame(gameId) {
  const token = localStorage.getItem("token");
  try {
    console.log(`Suppression de la partie ${gameId}`);
    
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include'
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Erreur lors du parsing de la réponse JSON:", parseError);
      return { message: "Partie supprimée avec succès" };
    }
  } catch (err) {
    console.error("Erreur lors de la suppression de la partie:", err);
    throw err;
  }
}