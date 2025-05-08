/**
 * Classe de base pour l'IA du jeu Game of Life
 */
export class AIPlayer {
  constructor() {
    this.gridSize = 20;
  }

  /**
   * Évalue la qualité d'un état de jeu pour l'IA (joueur 2)
   * @param {Object} gameState - État du jeu avec positions des deux joueurs
   * @return {number} - Score d'évaluation (plus élevé = meilleur pour l'IA)
   */
  evaluateState(gameState) {
    // Vérifier si les tableaux existent
    if (
      !Array.isArray(gameState.player1) ||
      !Array.isArray(gameState.player2)
    ) {
      return 0;
    }

    // Nombre de cellules pour chaque joueur
    const player1Cells = gameState.player1.length;
    const player2Cells = gameState.player2.length;

    // Positions stratégiques (coins et zones centrales ont plus de valeur)
    let player1StrategicValue = 0;
    let player2StrategicValue = 0;

    // Valeur des groupes de cellules adjacentes
    let player1GroupValue = this.calculateGroupValue(gameState.player1);
    let player2GroupValue = this.calculateGroupValue(gameState.player2);

    // Valeur des positions stratégiques
    gameState.player1.forEach(([row, col]) => {
      player1StrategicValue += this.getPositionValue(row, col);
    });

    gameState.player2.forEach(([row, col]) => {
      player2StrategicValue += this.getPositionValue(row, col);
    });

    // Le score final favorise le joueur 2 (IA)
    return (
      player2Cells * 10 +
      player2StrategicValue +
      player2GroupValue -
      (player1Cells * 10 + player1StrategicValue + player1GroupValue)
    );
  }

  /**
   * Attribue une valeur stratégique à une position sur la grille
   * Les positions centrales et les coins ont plus de valeur
   * @param {number} row - Ligne
   * @param {number} col - Colonne
   * @return {number} - Valeur stratégique de la position
   */
  getPositionValue(row, col) {
    // Les coins ont une valeur élevée
    if (
      (row === 0 || row === this.gridSize - 1) &&
      (col === 0 || col === this.gridSize - 1)
    ) {
      return 5;
    }

    // Les bords ont une valeur moyenne
    if (
      row === 0 ||
      row === this.gridSize - 1 ||
      col === 0 ||
      col === this.gridSize - 1
    ) {
      return 3;
    }

    // Le centre a une valeur élevée
    const centerDistance =
      Math.abs(row - this.gridSize / 2) + Math.abs(col - this.gridSize / 2);
    if (centerDistance < this.gridSize / 4) {
      return 4;
    }

    // Valeur par défaut pour les autres positions
    return 2;
  }

  /**
   * Calcule la valeur des groupes de cellules adjacentes
   * Les groupes compacts ont une valeur plus élevée car ils tendent à survivre
   * @param {Array} positions - Tableau des positions d'un joueur
   * @return {number} - Valeur des groupes
   */
  calculateGroupValue(positions) {
    let groupValue = 0;

    for (const [row, col] of positions) {
      let adjacentCount = 0;

      // Vérifier les 8 cellules adjacentes
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // Ignorer la cellule elle-même

          const adjacentPos = [row + i, col + j];
          if (
            positions.some(
              ([r, c]) => r === adjacentPos[0] && c === adjacentPos[1]
            )
          ) {
            adjacentCount++;
          }
        }
      }

      // Valeurs optimales pour le jeu de la vie : 2-3 voisins
      if (adjacentCount === 2 || adjacentCount === 3) {
        groupValue += 5;
      } else if (adjacentCount === 1) {
        groupValue += 2; // Au moins un voisin, mais pas optimal
      } else if (adjacentCount > 3) {
        groupValue += 1; // Trop de voisins, risque de surpopulation
      }
    }

    return groupValue;
  }

  /**
   * Génère tous les mouvements possibles étant donné un état de jeu
   * @param {Object} gameState - État du jeu
   * @param {Object} playerBlocks - Nombre de blocs placés par chaque joueur
   * @return {Array} - Liste des positions possibles pour le prochain mouvement
   */
  generatePossibleMoves(gameState, playerBlocks) {
    const possibleMoves = [];
    const occupiedPositions = new Set();

    // Marquer toutes les positions occupées
    for (const player of ["player1", "player2"]) {
      if (Array.isArray(gameState[player])) {
        for (const [row, col] of gameState[player]) {
          occupiedPositions.add(`${row},${col}`);
        }
      }
    }

    // Si l'IA a déjà placé ses 10 blocs, il n'y a plus de mouvement possible
    if (playerBlocks[2] >= 10) {
      return possibleMoves;
    }

    // Générer toutes les positions libres
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (!occupiedPositions.has(`${row},${col}`)) {
          possibleMoves.push([row, col]);
        }
      }
    }

    // Pour limiter la complexité, on peut prendre un échantillon aléatoire de mouvements possibles
    // si le nombre de possibilités est trop grand
    if (possibleMoves.length > 20) {
      return this.sampleMoves(possibleMoves, 20);
    }

    return possibleMoves;
  }

  /**
   * Prend un échantillon aléatoire de mouvements possibles
   * @param {Array} moves - Liste complète des mouvements
   * @param {number} sampleSize - Taille de l'échantillon à prendre
   * @return {Array} - Échantillon de mouvements
   */
  sampleMoves(moves, sampleSize) {
    const shuffled = [...moves].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sampleSize);
  }

  /**
   * Applique un mouvement à un état de jeu et retourne le nouvel état
   * @param {Object} gameState - État actuel du jeu
   * @param {Array} move - Mouvement à appliquer [row, col]
   * @param {number} player - Joueur qui fait le mouvement (1 ou 2)
   * @return {Object} - Nouvel état après le mouvement
   */
  applyMove(gameState, move, player) {
    const newState = {
      player1: [...gameState.player1],
      player2: [...gameState.player2],
    };

    if (player === 1) {
      newState.player1.push(move);
    } else {
      newState.player2.push(move);
    }

    return newState;
  }
}

/**
 * Implémentation de l'algorithme MinMax pour le jeu
 */
export class MinMaxStrategy extends AIPlayer {
  constructor() {
    super();
    this.maxDepth = 3; // Profondeur maximale pour l'algorithme MinMax
  }

  /**
   * Obtient le meilleur mouvement pour l'IA selon l'algorithme MinMax
   * @param {Object} gameState - État actuel du jeu
   * @param {Object} playerBlocks - Nombre de blocs placés par chaque joueur
   * @return {Array} - Mouvement optimal [row, col]
   */
  getBestMove(gameState, playerBlocks) {
    // Si c'est le premier mouvement, placer une cellule stratégiquement
    if (gameState.player1.length === 0 && gameState.player2.length === 0) {
      // Commencer près du centre de la grille
      return [Math.floor(this.gridSize / 2), Math.floor(this.gridSize / 2)];
    }

    const possibleMoves = this.generatePossibleMoves(gameState, playerBlocks);
    let bestScore = -Infinity;
    let bestMove = possibleMoves[0] || [0, 0]; // Valeur par défaut au cas où il n'y a pas de mouvement

    for (const move of possibleMoves) {
      // Appliquer le mouvement pour le joueur 2 (IA)
      const newState = this.applyMove(gameState, move, 2);

      // Calculer le score pour ce mouvement avec l'algorithme MinMax
      const score = this.minimax(newState, this.maxDepth, false, playerBlocks);

      // Mettre à jour le meilleur mouvement si nécessaire
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Algorithme MinMax pour l'évaluation des mouvements
   * @param {Object} gameState - État du jeu
   * @param {number} depth - Profondeur actuelle dans l'arbre de recherche
   * @param {boolean} isMaximizing - Indique si c'est le tour du joueur maximisant (IA)
   * @param {Object} playerBlocks - Nombre de blocs placés par chaque joueur
   * @return {number} - Score d'évaluation du mouvement
   */
  minimax(gameState, depth, isMaximizing, playerBlocks) {
    // Cas de base : profondeur maximale atteinte ou jeu terminé
    if (depth === 0) {
      return this.evaluateState(gameState);
    }

    // Mettre à jour le nombre de blocs
    const updatedPlayerBlocks = {
      1: playerBlocks[1] + (isMaximizing ? 0 : 1),
      2: playerBlocks[2] + (isMaximizing ? 1 : 0),
    };

    // Vérifier si les deux joueurs ont placé tous leurs blocs
    if (updatedPlayerBlocks[1] >= 10 && updatedPlayerBlocks[2] >= 10) {
      return this.evaluateState(gameState);
    }

    const possibleMoves = this.generatePossibleMoves(
      gameState,
      updatedPlayerBlocks
    );

    // Si aucun mouvement n'est possible, retourner l'évaluation de l'état actuel
    if (possibleMoves.length === 0) {
      return this.evaluateState(gameState);
    }

    if (isMaximizing) {
      // Tour de l'IA (joueur 2)
      let maxScore = -Infinity;
      for (const move of possibleMoves) {
        const newState = this.applyMove(gameState, move, 2);
        const score = this.minimax(
          newState,
          depth - 1,
          false,
          updatedPlayerBlocks
        );
        maxScore = Math.max(maxScore, score);
      }
      return maxScore;
    } else {
      // Tour du joueur humain (joueur 1)
      let minScore = Infinity;
      for (const move of possibleMoves) {
        const newState = this.applyMove(gameState, move, 1);
        const score = this.minimax(
          newState,
          depth - 1,
          true,
          updatedPlayerBlocks
        );
        minScore = Math.min(minScore, score);
      }
      return minScore;
    }
  }
}

/**
 * Implémentation de l'algorithme AlphaBeta (MinMax avec élagage Alpha-Beta) pour le jeu
 */
export class AlphaBetaStrategy extends AIPlayer {
  constructor() {
    super();
    this.maxDepth = 4; // Profondeur plus grande que MinMax car l'élagage permet un parcours plus efficace
  }

  /**
   * Obtient le meilleur mouvement pour l'IA selon l'algorithme AlphaBeta
   * @param {Object} gameState - État actuel du jeu
   * @param {Object} playerBlocks - Nombre de blocs placés par chaque joueur
   * @return {Array} - Mouvement optimal [row, col]
   */
  getBestMove(gameState, playerBlocks) {
    // Si c'est le premier mouvement, placer une cellule stratégiquement
    if (gameState.player1.length === 0 && gameState.player2.length === 0) {
      // Commencer près du centre de la grille
      return [Math.floor(this.gridSize / 2), Math.floor(this.gridSize / 2)];
    }

    const possibleMoves = this.generatePossibleMoves(gameState, playerBlocks);
    let bestScore = -Infinity;
    let bestMove = possibleMoves[0] || [0, 0]; // Valeur par défaut au cas où il n'y a pas de mouvement
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of possibleMoves) {
      // Appliquer le mouvement pour le joueur 2 (IA)
      const newState = this.applyMove(gameState, move, 2);

      // Calculer le score pour ce mouvement avec l'algorithme AlphaBeta
      const score = this.alphaBeta(
        newState,
        this.maxDepth,
        alpha,
        beta,
        false,
        playerBlocks
      );

      // Mettre à jour le meilleur mouvement si nécessaire
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      // Mise à jour de alpha
      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }

  /**
   * Algorithme AlphaBeta pour l'évaluation des mouvements avec élagage
   * @param {Object} gameState - État du jeu
   * @param {number} depth - Profondeur actuelle dans l'arbre de recherche
   * @param {number} alpha - Valeur alpha pour l'élagage
   * @param {number} beta - Valeur beta pour l'élagage
   * @param {boolean} isMaximizing - Indique si c'est le tour du joueur maximisant (IA)
   * @param {Object} playerBlocks - Nombre de blocs placés par chaque joueur
   * @return {number} - Score d'évaluation du mouvement
   */
  alphaBeta(gameState, depth, alpha, beta, isMaximizing, playerBlocks) {
    // Cas de base : profondeur maximale atteinte ou jeu terminé
    if (depth === 0) {
      return this.evaluateState(gameState);
    }

    // Mettre à jour le nombre de blocs
    const updatedPlayerBlocks = {
      1: playerBlocks[1] + (isMaximizing ? 0 : 1),
      2: playerBlocks[2] + (isMaximizing ? 1 : 0),
    };

    // Vérifier si les deux joueurs ont placé tous leurs blocs
    if (updatedPlayerBlocks[1] >= 10 && updatedPlayerBlocks[2] >= 10) {
      return this.evaluateState(gameState);
    }

    const possibleMoves = this.generatePossibleMoves(
      gameState,
      updatedPlayerBlocks
    );

    // Si aucun mouvement n'est possible, retourner l'évaluation de l'état actuel
    if (possibleMoves.length === 0) {
      return this.evaluateState(gameState);
    }

    if (isMaximizing) {
      // Tour de l'IA (joueur 2)
      let maxScore = -Infinity;
      for (const move of possibleMoves) {
        const newState = this.applyMove(gameState, move, 2);
        const score = this.alphaBeta(
          newState,
          depth - 1,
          alpha,
          beta,
          false,
          updatedPlayerBlocks
        );
        maxScore = Math.max(maxScore, score);

        // Élagage Alpha
        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          break; // Coupe Beta
        }
      }
      return maxScore;
    } else {
      // Tour du joueur humain (joueur 1)
      let minScore = Infinity;
      for (const move of possibleMoves) {
        const newState = this.applyMove(gameState, move, 1);
        const score = this.alphaBeta(
          newState,
          depth - 1,
          alpha,
          beta,
          true,
          updatedPlayerBlocks
        );
        minScore = Math.min(minScore, score);

        // Élagage Beta
        beta = Math.min(beta, score);
        if (beta <= alpha) {
          break; // Coupe Alpha
        }
      }
      return minScore;
    }
  }

  /**
   * Surcharge de la méthode d'évaluation pour ajouter des facteurs plus sophistiqués
   * @param {Object} gameState - État du jeu
   * @return {number} - Score d'évaluation amélioré
   */
  evaluateState(gameState) {
    // Récupérer l'évaluation de base
    const baseScore = super.evaluateState(gameState);

    // Ajouter des facteurs supplémentaires pour l'AlphaBeta (plus sophistiqué)

    // 1. Potentiel de croissance : analyser les positions qui pourraient générer de nouvelles cellules
    const player1Growth = this.evaluateGrowthPotential(
      gameState.player1,
      gameState
    );
    const player2Growth = this.evaluateGrowthPotential(
      gameState.player2,
      gameState
    );

    // 2. Contrôle du territoire : évaluer la quantité d'espace contrôlé par chaque joueur
    const player1Territory = this.evaluateTerritory(
      gameState.player1,
      gameState
    );
    const player2Territory = this.evaluateTerritory(
      gameState.player2,
      gameState
    );

    // Le score final, avec une pondération plus sophistiquée
    return (
      baseScore +
      (player2Growth - player1Growth) * 2 + // Le potentiel de croissance est important
      (player2Territory - player1Territory)
    ); // Le contrôle du territoire est également important
  }

  /**
   * Évalue le potentiel de croissance pour un joueur à partir de ses positions actuelles
   * @param {Array} positions - Positions du joueur
   * @param {Object} gameState - État complet du jeu
   * @return {number} - Score du potentiel de croissance
   */
  evaluateGrowthPotential(positions, gameState) {
    let growthScore = 0;
    const occupiedCells = new Set();

    // Marquer toutes les cellules occupées
    for (const player of ["player1", "player2"]) {
      if (Array.isArray(gameState[player])) {
        for (const [row, col] of gameState[player]) {
          occupiedCells.add(`${row},${col}`);
        }
      }
    }

    // Analyser chaque position pour son potentiel à créer de nouvelles cellules
    for (const [row, col] of positions) {
      // Vérifier les cellules vides adjacentes
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          if (i === 0 && j === 0) continue; // Ignorer la cellule elle-même

          const newRow = row + i;
          const newCol = col + j;

          // Vérifier si la cellule est dans les limites et vide
          if (
            newRow >= 0 &&
            newRow < this.gridSize &&
            newCol >= 0 &&
            newCol < this.gridSize &&
            !occupiedCells.has(`${newRow},${newCol}`)
          ) {
            // Compter les voisins vivants autour de cette cellule vide
            let liveNeighbors = 0;
            for (let ni = -1; ni <= 1; ni++) {
              for (let nj = -1; nj <= 1; nj++) {
                if (ni === 0 && nj === 0) continue;

                const neighborRow = newRow + ni;
                const neighborCol = newCol + nj;

                if (occupiedCells.has(`${neighborRow},${neighborCol}`)) {
                  liveNeighbors++;
                }
              }
            }

            // Si la cellule vide a exactement 3 voisins vivants, elle naîtra à la prochaine génération
            if (liveNeighbors === 3) {
              growthScore += 5;
            } else if (liveNeighbors === 2) {
              // Avec 2 voisins, la cellule est à un voisin de naître
              growthScore += 2;
            }
          }
        }
      }
    }

    return growthScore;
  }

  /**
   * Évalue le contrôle du territoire pour un joueur
   * @param {Array} positions - Positions du joueur
   * @param {Object} gameState - État complet du jeu
   * @return {number} - Score de contrôle du territoire
   */
  evaluateTerritory(positions, gameState) {
    // Créer une carte d'influence
    const influenceMap = Array(this.gridSize)
      .fill()
      .map(() => Array(this.gridSize).fill(0));

    // Marquer l'influence de chaque cellule du joueur
    for (const [row, col] of positions) {
      // La cellule elle-même a une influence maximale
      influenceMap[row][col] = 10;

      // Les cellules adjacentes ont une influence décroissante avec la distance
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          if (i === 0 && j === 0) continue;

          const newRow = row + i;
          const newCol = col + j;

          // Vérifier si la cellule est dans les limites
          if (
            newRow >= 0 &&
            newRow < this.gridSize &&
            newCol >= 0 &&
            newCol < this.gridSize
          ) {
            // Calculer l'influence en fonction de la distance (Manhattan)
            const distance = Math.abs(i) + Math.abs(j);
            const influence = Math.max(0, 5 - distance);

            // Ajouter l'influence à la carte
            influenceMap[newRow][newCol] += influence;
          }
        }
      }
    }

    // Calculer le score total d'influence
    let totalInfluence = 0;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        totalInfluence += influenceMap[row][col];
      }
    }

    return totalInfluence;
  }
}
