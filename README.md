# Game of Life - Battle Edition | Rapport de Fin de Projet

Testez le jeu ! 🔥
Nous avons mit le jeu en ligne sur un serveur :  https://gol.gelk.fr/

## Table des matières

1. [Introduction](#introduction)
2. [Présentation du Jeu](#présentation-du-jeu)
3. [Architecture](#architecture)
4. [Fonctionnalités](#fonctionnalités)
5. [Frontend](#frontend)
6. [Backend](#backend)
7. [Communication Client-Serveur](#communication-client-serveur)
8. [WebSocket et Temps Réel](#websocket-et-temps-réel)
9. [Enregistrement des Parties](#enregistrement-des-parties)
10. [Mode Ordinateur](#mode-ordinateur)
11. [Conclusion et Perspectives](#conclusion-et-perspectives)

## Introduction

Ce rapport présente le projet "Game of Life - Battle Edition", une version compétitive du célèbre automate cellulaire inventé par John Conway. Ce projet a été développé dans le cadre de notre formation M1 DWM et constitue une application web complète avec un backend en Python (FastAPI) et un frontend en JavaScript.

### Contexte et objectifs

Le Jeu de la Vie de Conway est un exemple classique d'automate cellulaire capable de simuler des comportements complexes à partir de règles simples. Notre objectif était de transformer ce système généralement utilisé comme démonstration mathématique en un jeu multijoueur stratégique et engageant. Nous voulions également explorer les technologies modernes de développement web, notamment les WebSockets pour la communication en temps réel et les algorithmes d'IA pour créer des adversaires artificiels.

## Présentation du Jeu

### Règles du Jeu de la Vie

Le Jeu de la Vie de Conway est un automate cellulaire régi par des règles simples :

- Une cellule morte avec exactement 3 voisins vivants devient vivante (naissance)
- Une cellule vivante avec 2 ou 3 voisins vivants reste vivante (survie)
- Dans tous les autres cas, la cellule meurt ou reste morte (surpopulation ou isolement)

Ces règles simples produisent des comportements émergents fascinants : structures stables, oscillateurs, vaisseaux mobiles et patterns chaotiques.

### Notre version Battle

Notre version transforme ce jeu en un format compétitif entre deux joueurs :

1. Chaque joueur place alternativement 10 cellules sur la grille (phase de placement)
2. Une fois les cellules placées, l'évolution automatique commence selon les règles de Conway (phase d'évolution)
3. Le gagnant est celui qui possède le plus de cellules vivantes à la fin d'un nombre prédéfini de générations

Cette adaptation transforme un système déterministe en un jeu stratégique où le placement initial des cellules est crucial pour maximiser la survie et la reproduction.

### Stratégies de jeu

Plusieurs stratégies peuvent être employées :

- **Structures stables** : Placer des configurations connues comme les "blocs" ou "ruches" qui ne changent pas
- **Oscillateurs** : Utiliser des configurations comme le "clignotant" ou la "grenouille" qui oscillent de manière prévisible
- **Expansion** : Disposer des cellules d'une manière qui maximise leur propagation
- **Interférence** : Placer des cellules pour perturber les structures de l'adversaire

### Modes de jeu

- **Mode Versus** : Deux joueurs s'affrontent en temps réel via WebSocket
- **Mode IA** : Un joueur affronte une intelligence artificielle (algorithmes MinMax ou AlphaBeta)
- **Mode Replay** : Visualisation des parties précédemment jouées pour analyser les stratégies

## Architecture

Le projet suit une architecture moderne client-serveur :

```
├── Backend (FastAPI)
│   ├── API REST (main.py)
│   ├── Gestion WebSocket (game_manager.py, websocket_manager.py)
│   ├── Base de données (database.py, models.py)
│   └── Logique du jeu (services.py)
└── Frontend (JavaScript)
    ├── Interface utilisateur (HTML/CSS)
    ├── Moteur du jeu (playerClass.js)
    └── IA côté client (ai-player.js)
```

### Choix technologiques

- **Backend** : Python avec FastAPI pour des performances optimales et une intégration facile des WebSockets
- **Frontend** : JavaScript vanilla avec TailwindCSS pour une interface réactive
- **Base de données** : SQLite pour la simplicité de déploiement
- **Communication** : REST API pour les opérations CRUD et WebSockets pour les communications en temps réel
- **Conteneurisation** : Docker avec docker-compose pour faciliter le déploiement

### Justification des choix techniques

- **FastAPI** a été choisi pour sa performance, son typage fort avec Pydantic et sa documentation automatique avec Swagger
- **JavaScript vanilla** plutôt qu'un framework pour minimiser la complexité et optimiser les performances du rendu de la grille
- **WebSockets** pour permettre une communication bidirectionnelle et en temps réel essentielle à l'expérience de jeu
- **SQLite** pour sa facilité d'intégration sans nécessiter de configuration d'un serveur de base de données distinct
- **Docker** pour garantir un environnement de développement et de production cohérent

## Fonctionnalités

- **Système d'authentification** : Inscription, connexion, et gestion des utilisateurs avec tokens JWT
- **Matchmaking** : Mise en relation automatique des joueurs pour les parties versus
- **Mode IA** : Algorithmes MinMax et AlphaBeta pour jouer contre l'ordinateur avec différents niveaux de difficulté
- **Sauvegarde automatique** : Toutes les parties sont enregistrées pour être rejouées
- **Interface responsive** : Adaptée à différentes tailles d'écrans
- **Communication en temps réel** : Les joueurs voient instantanément les actions de leur adversaire
- **Système ELO** : Mise à jour automatique des classements après chaque partie

### Expérience utilisateur

Le flux utilisateur typique comprend :

1. Création d'un compte ou connexion
2. Choix du mode de jeu (versus humain ou IA)
3. En mode versus : attente d'un autre joueur via le système de matchmaking
4. Phase de placement des cellules initiales (10 par joueur)
5. Observation de l'évolution automatique du jeu et du résultat
6. Possibilité de consulter l'historique des parties et de les rejouer

## Frontend

Le frontend utilise JavaScript vanilla et se concentre sur la performance et l'accessibilité.

### Structure

- `index.html` et autres pages HTML : Structure de base des différentes vues
- `src/services/` : Services pour la communication avec le backend (API REST)
- `src/playerClass.js` : Classe gérant les joueurs humains et le cycle de jeu
- `src/ai-player.js` : Implémentation des algorithmes d'IA (MinMax et AlphaBeta)
- `src/conway.css` : Styles spécifiques au jeu

### Composants clés

- **Moteur de rendu** : Utilise Canvas pour un affichage performant de la grille du jeu
- **Gestionnaire d'événements** : Capture les clics utilisateur pour le placement des cellules
- **Client WebSocket** : Gère la communication en temps réel avec le serveur
- **Système d'authentification** : Gère les tokens JWT et les sessions utilisateur
- **Module de replay** : Permet de visualiser les parties enregistrées étape par étape

### Architecture des services frontend

Nous avons adopté une approche modulaire avec des services spécialisés :

- `services/login.js` : Gestion de l'authentification
- `services/register.js` : Création de nouveaux comptes
- `services/play.js` : Communication avec le backend pour le jeu
- `services/savedGames.js` : Récupération et affichage des parties sauvegardées
- `services/userMe.js` : Gestion du profil utilisateur
- `services/allUser.js` : Administration des utilisateurs

Ces services encapsulent les appels API et la gestion des états, fournissant une interface claire pour les composants d'interface utilisateur.

## Backend

Le backend est construit avec FastAPI et gère la logique métier, l'authentification et la persistance des données.

### Composants principaux

- `main.py` : Point d'entrée et configuration de l'API, définition des routes HTTP
- `game_manager.py` : Gestion des parties et des connexions WebSocket
- `websocket_manager.py` : Abstraction pour la gestion des connexions WebSocket
- `models.py` et `schemas.py` : Définition des modèles de données et validation avec Pydantic
- `services.py` : Logique métier et accès aux données
- `database.py` : Configuration et interactions avec la base de données SQLite

### Structure de la base de données

Le schéma comprend plusieurs tables principales :

- `Users` : Informations des utilisateurs et authentification (id, username, hashed_password, email, elo)
- `Games` : Métadonnées des parties (id, player1_id, player2_id, winner_id, start_time, end_time)
- `GameMoves` : Positions initiales des cellules pour chaque partie (id, game_id, player_id, x, y, move_number)
- `GameStates` : États successifs de la grille pour permettre le replay

### Système de matchmaking

Le système de matchmaking est implémenté dans `game_manager.py` et gère :

1. La mise en file d'attente des joueurs avec `waiting_players`
2. La création automatique de parties dès que 2 joueurs sont disponibles
3. La notification des joueurs du début de la partie
4. L'attribution d'identifiants uniques aux parties via `active_games`

Un extrait de l'implémentation du matchmaking :

```python
async def add_player(self, websocket: WebSocket):
    await websocket.accept()

    # Attendre de recevoir le username
    init_data = await websocket.receive_text()
    player_data = json.loads(init_data)
    username = player_data.get('username', 'Anonyme')

    self.waiting_players.append((websocket, username))

    if len(self.waiting_players) >= 2:
        player1, username1 = self.waiting_players.pop(0)
        player2, username2 = self.waiting_players.pop(0)

        game_id = f"game_{len(self.active_games) + 1}"
        self.active_games[game_id] = [player1, player2]
        self.game_states[game_id] = {
            "current_player": 1,
            "game_data": {"player1": [], "player2": []},
            "usernames": {
                "player1": username1,
                "player2": username2
            }
        }

        # Notifier les joueurs avec leur numéro et les usernames
        await player1.send_text(json.dumps({
            "type": "game_start",
            "player_number": 1,
            "message": f"Partie trouvée ! Vous êtes {username1}",
            "usernames": {
                "player1": username1,
                "player2": username2
            }
        }))
```

## Communication Client-Serveur

La communication entre le frontend et le backend s'effectue de deux manières :

1. **API REST** pour :

   - L'authentification (login, register)
   - La récupération des parties enregistrées
   - La gestion des utilisateurs et des profils
   - Les opérations non temps réel

2. **WebSockets** pour :
   - Le matchmaking en temps réel
   - Les actions de jeu (placement de cellules)
   - L'évolution des générations du jeu de la vie
   - Les notifications (début/fin de partie, tour de jeu)

### Endpoints REST principaux

Notre API expose plusieurs endpoints REST clairement définis avec des tags pour la documentation Swagger :

- **Authentification** : `POST /token` pour obtenir un JWT
- **Utilisateurs** : `GET /users/`, `POST /users/`, `GET /users/me/`
- **Parties** : `GET /games/`, `POST /games/`, `GET /games/{game_id}`
- **Mouvements** : `POST /games/{game_id}/moves`
- **ELO** : `PATCH /users/elo/{user_add}/{user_remove}`

### Format des messages WebSocket

Les messages WebSocket utilisent un format JSON structuré avec :

- Un type de message (action, notification, etc.)
- Des données spécifiques au type de message
- Des métadonnées (timestamp, identifiants)

Exemples de messages :

1. **Début de partie** :

```json
{
  "type": "game_start",
  "player_number": 1,
  "message": "Partie trouvée ! Vous êtes Joueur1",
  "usernames": {
    "player1": "Joueur1",
    "player2": "Joueur2"
  }
}
```

2. **Placement de cellule** :

```json
{
  "type": "move",
  "game_data": {
    "player1": [
      [5, 10],
      [8, 12]
    ],
    "player2": [[15, 7]]
  }
}
```

3. **Début des générations** :

```json
{
  "type": "start_generations"
}
```

## WebSocket et Temps Réel

Les WebSockets sont au cœur de l'expérience de jeu en temps réel :

### Côté serveur

Le backend gère deux types de WebSockets :

1. `/messages/` pour les communications générales (chat, notifications)
2. `/game/` pour toutes les communications liées au jeu

Le `GameManager` gère les connexions et distribue les messages entre les joueurs d'une même partie. Il est responsable de :

- L'acceptation des nouvelles connexions
- La mise en relation des joueurs (matchmaking)
- La diffusion des actions de jeu entre les joueurs
- La synchronisation des états de jeu
- La détection de déconnexion et la gestion des timeouts

### Gestion des messages de jeu

Le traitement des messages utilise une architecture événementielle. Dans `game_manager.py`, la méthode `handle_message` traite les différents types de messages :

```python
async def handle_message(self, websocket: WebSocket, message: str):
    try:
        if message != "start_generations" and message != "finish_game":
            data = json.loads(message)

        for game_id, players in self.active_games.items():
            if websocket in players:
                if message == "start_generations":
                    # envoie un message au joueur 1 et au joueur 2
                    await asyncio.gather(
                        players[0].send_text(json.dumps({"type": "start_generations"})),
                        players[1].send_text(json.dumps({"type": "start_generations"}))
                    )
                # Autres types de messages traités ici...
    except Exception as e:
        print("Erreur lors du traitement du message:", str(e))
```

### Côté client

Le frontend établit une connexion WebSocket au démarrage d'une partie et :

- Envoie les actions du joueur (placements de cellules)
- Reçoit les actions de l'adversaire
- Synchronise l'affichage de la grille
- Gère les notifications de début/fin de partie
- Implémente des mécanismes de reconnexion en cas de problème réseau

Les messages reçus sont traités par des gestionnaires d'événements spécifiques qui mettent à jour l'interface utilisateur.

## Enregistrement des Parties

Toutes les parties sont automatiquement enregistrées dans la base de données pour permettre leur replay :

### Structure des données enregistrées

- **Métadonnées** : Identifiants des joueurs, timestamps, résultat final
- **État initial** : Positions initiales des cellules pour chaque joueur
- **États successifs** : Évolution de la grille à chaque génération (optionnel, peut être recalculé)
- **Actions** : Séquence des placements de cellules par les joueurs

### Fonctionnalités d'enregistrement

Notre système d'enregistrement offre plusieurs fonctionnalités clés :

1. **Sauvegarde automatique** : Chaque partie est enregistrée dès qu'elle commence
2. **Mise à jour en temps réel** : Les états sont mis à jour à mesure que la partie progresse
3. **Persistance complète** : Tous les mouvements sont stockés pour un replay fidèle
4. **Optimisation du stockage** : Seuls les états clés sont conservés, les autres étant recalculés à la demande

### Implémentation du système de replay

Le replay utilise le code existant du moteur de jeu, mais en mode "lecture seule" :

1. Les positions initiales sont chargées depuis la base de données
2. Le moteur de jeu applique les règles du Jeu de la Vie
3. L'interface utilisateur permet de contrôler la vitesse et la direction du replay

Un contrôleur spécifique (`src/replay.js`) gère l'interface de replay en offrant des contrôles comme pause, vitesse, avance/retour.

## Mode Ordinateur

Le mode ordinateur implémente deux algorithmes d'intelligence artificielle pour offrir un défi aux joueurs solo :

### Algorithme MinMax

L'algorithme MinMax est une technique classique utilisée dans les jeux à somme nulle qui :

1. Explore l'arbre des possibilités jusqu'à une certaine profondeur
2. Évalue chaque état possible du jeu avec une fonction d'évaluation
3. Choisit le coup qui maximise le score pour l'IA tout en supposant que l'adversaire joue optimalement

Dans notre implémentation (`MinMaxStrategy` dans `ai-player.js`) :

- **Profondeur d'exploration** : 3 niveaux
- **Évaluation basée sur** :
  - Nombre de cellules vivantes (10 points par cellule)
  - Positions stratégiques (coins 5 pts, bords 3 pts, centre 4 pts)
  - Groupes compacts de cellules (5 pts pour les groupes avec 2-3 voisins)
  - Potentiel d'expansion

Voici l'implémentation de la fonction d'évaluation de base :

```javascript
evaluateState(gameState) {
  // Vérifier si les tableaux existent
  if (!Array.isArray(gameState.player1) || !Array.isArray(gameState.player2)) {
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
```

L'algorithme MinMax lui-même parcourt récursivement l'arbre des possibilités, alternant entre les joueurs pour simuler les tours de jeu :

```javascript
minimax(gameState, depth, isMaximizing, playerBlocks) {
  // Cas de base : profondeur maximale atteinte ou jeu terminé
  if (depth === 0) {
    return this.evaluateState(gameState);
  }

  // Mise à jour du nombre de blocs placés
  const updatedPlayerBlocks = {
    1: playerBlocks[1] + (isMaximizing ? 0 : 1),
    2: playerBlocks[2] + (isMaximizing ? 1 : 0),
  };

  // Vérifier si les deux joueurs ont placé tous leurs blocs
  if (updatedPlayerBlocks[1] >= 10 && updatedPlayerBlocks[2] >= 10) {
    return this.evaluateState(gameState);
  }

  const possibleMoves = this.generatePossibleMoves(gameState, updatedPlayerBlocks);

  // Tour de l'IA ou du joueur humain
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of possibleMoves) {
      const newState = this.applyMove(gameState, move, 2);
      const score = this.minimax(newState, depth - 1, false, updatedPlayerBlocks);
      maxScore = Math.max(maxScore, score);
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of possibleMoves) {
      const newState = this.applyMove(gameState, move, 1);
      const score = this.minimax(newState, depth - 1, true, updatedPlayerBlocks);
      minScore = Math.min(minScore, score);
    }
    return minScore;
  }
}
```

### Algorithme AlphaBeta

L'algorithme AlphaBeta est une optimisation du MinMax qui permet d'explorer plus efficacement l'arbre des possibilités :

1. Utilise deux valeurs (alpha et beta) pour élaguer les branches inutiles
2. Permet d'explorer plus profondément avec les mêmes ressources
3. Ajoute des critères d'évaluation plus sophistiqués

Notre implémentation (`AlphaBetaStrategy` dans `ai-player.js`) apporte plusieurs améliorations :

- **Profondeur d'exploration** : 4 niveaux (contre 3 pour MinMax)
- **Critères d'évaluation supplémentaires** :
  - Potentiel de croissance des cellules
  - Contrôle du territoire
  - Analyse des schémas stables et oscillateurs
  - Distance entre les cellules adverses

L'évaluation du potentiel de croissance est particulièrement importante :

```javascript
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
        if (i === 0 && j === 0) continue;

        const newRow = row + i;
        const newCol = col + j;

        // Vérifier les voisins vivants autour des cellules vides
        if (
          newRow >= 0 &&
          newRow < this.gridSize &&
          newCol >= 0 &&
          newCol < this.gridSize &&
          !occupiedCells.has(`${newRow},${newCol}`)
        ) {
          // Si la cellule vide a exactement 3 voisins vivants,
          // elle naîtra à la prochaine génération
          let liveNeighbors = this.countLiveNeighbors(newRow, newCol, occupiedCells);
          if (liveNeighbors === 3) {
            growthScore += 5;
          } else if (liveNeighbors === 2) {
            growthScore += 2;
          }
        }
      }
    }
  }

  return growthScore;
}
```

L'algorithme AlphaBeta lui-même étend MinMax avec l'élagage des branches non prometteuses :

```javascript
alphaBeta(gameState, depth, alpha, beta, isMaximizing, playerBlocks) {
  // Cas de base : profondeur maximale atteinte ou jeu terminé
  if (depth === 0) {
    return this.evaluateState(gameState);
  }

  // Mise à jour du nombre de blocs
  const updatedPlayerBlocks = {
    1: playerBlocks[1] + (isMaximizing ? 0 : 1),
    2: playerBlocks[2] + (isMaximizing ? 1 : 0),
  };

  const possibleMoves = this.generatePossibleMoves(gameState, updatedPlayerBlocks);

  if (isMaximizing) {
    // Tour de l'IA (joueur 2)
    let maxScore = -Infinity;
    for (const move of possibleMoves) {
      const newState = this.applyMove(gameState, move, 2);
      const score = this.alphaBeta(
        newState, depth - 1, alpha, beta, false, updatedPlayerBlocks
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
        newState, depth - 1, alpha, beta, true, updatedPlayerBlocks
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
```

### Optimisations spécifiques au Jeu de la Vie

L'adaptation des algorithmes MinMax et AlphaBeta au Jeu de la Vie a nécessité plusieurs optimisations :

1. **Réduction de l'espace de recherche** : Notre implémentation utilise un échantillonnage des positions possibles quand il y en a trop :

```javascript
generatePossibleMoves(gameState, playerBlocks) {
  const possibleMoves = [];
  const occupiedPositions = new Set();

  // Marquer les positions occupées...

  // Si l'espace est trop grand, prendre un échantillon
  if (possibleMoves.length > 20) {
    return this.sampleMoves(possibleMoves, 20);
  }

  return possibleMoves;
}

sampleMoves(moves, sampleSize) {
  const shuffled = [...moves].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, sampleSize);
}
```

2. **Évaluation contextuelle** : Les positions sont évaluées en fonction de leur contexte dans le jeu de la vie :

```javascript
calculateGroupValue(positions) {
  let groupValue = 0;

  for (const [row, col] of positions) {
    let adjacentCount = 0;

    // Vérifier les 8 cellules adjacentes
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const adjacentPos = [row + i, col + j];
        if (positions.some(([r, c]) => r === adjacentPos[0] && c === adjacentPos[1])) {
          adjacentCount++;
        }
      }
    }

    // Valeurs optimales pour le jeu de la vie : 2-3 voisins
    if (adjacentCount === 2 || adjacentCount === 3) {
      groupValue += 5;
    } else if (adjacentCount === 1) {
      groupValue += 2;
    } else if (adjacentCount > 3) {
      groupValue += 1; // Risque de surpopulation
    }
  }

  return groupValue;
}
```

3. **Analyse du contrôle territorial** : L'algorithme AlphaBeta analyse l'influence spatiale des pièces :

```javascript
evaluateTerritory(positions, gameState) {
  // Créer une carte d'influence
  const influenceMap = Array(this.gridSize)
    .fill()
    .map(() => Array(this.gridSize).fill(0));

  // Marquer l'influence de chaque cellule
  for (const [row, col] of positions) {
    // La cellule elle-même a une influence maximale
    influenceMap[row][col] = 10;

    // Les cellules adjacentes ont une influence décroissante avec la distance
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        // Calculer l'influence en fonction de la distance (Manhattan)
        const distance = Math.abs(i) + Math.abs(j);
        const influence = Math.max(0, 5 - distance);

        // Ajouter l'influence à la carte si la cellule est dans les limites
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 && newRow < this.gridSize &&
          newCol >= 0 && newCol < this.gridSize
        ) {
          influenceMap[newRow][newCol] += influence;
        }
      }
    }
  }

  // Calculer le score total d'influence
  return influenceMap.flat().reduce((sum, val) => sum + val, 0);
}
```

## Conclusion et Perspectives

Le projet "Game of Life - Battle Edition" démontre comment un système simple comme l'automate cellulaire de Conway peut être transformé en un jeu stratégique captivant. L'architecture client-serveur moderne avec communication en temps réel offre une expérience utilisateur fluide, tandis que l'IA basée sur les algorithmes MinMax et AlphaBeta propose un défi stimulant aux joueurs solo.

### Défis rencontrés

Durant le développement, nous avons fait face à plusieurs défis techniques :

- **Synchronisation en temps réel** entre les joueurs via WebSockets
- **Optimisation du rendu** de la grille pour de grandes dimensions
- **Adaptation des algorithmes d'IA** au contexte spécifique du Jeu de la Vie
- **Gestion des déconnexions** et des problèmes réseau
- **Équilibrage de la difficulté** des adversaires IA

### Concepts avancés explorés

Ce projet a permis d'explorer et d'appliquer plusieurs concepts avancés :

- Communication en temps réel avec WebSockets
- Algorithmes d'intelligence artificielle pour les jeux
- Architecture web moderne avec séparation claire frontend/backend
- Persistance et visualisation des données de jeu
- Optimisation des performances côté client et serveur

<!-- ### Perspectives d'évolution

Le projet constitue une base solide qui pourrait être étendue avec des fonctionnalités supplémentaires :

- **Classement des joueurs** et système ELO plus sophistiqué
- **Variantes de règles** du Jeu de la Vie (HighLife, Day & Night, etc.)
- **Algorithmes d'IA plus sophistiqués** utilisant l'apprentissage automatique
- **Mode tournoi** avec plusieurs joueurs
- **Version mobile** adaptée aux écrans tactiles
- **Personnalisation visuelle** (thèmes, couleurs des cellules)
- **Intégration de profils sociaux** permettant le partage de replays

En conclusion, ce projet a permis de transformer un concept mathématique fascinant en une expérience ludique interactive, tout en explorant des technologies web modernes et des algorithmes d'IA classiques. Le modèle implémenté est évolutif et pourrait servir de base à des développements futurs plus sophistiqués. -->
