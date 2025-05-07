# api for template

## Initialize the project

1. Create a virtual environment

```bash
python3 -m venv venv
```

2. Activate the virtual environment

```bash
source venv/bin/activate
```

3. Install the dependencies

```bash
pip3 install -r requirements.txt
```

4. Run the application

```bash
cd .. && make run
```

5. Open the browser and go to http://127.0.0.1:8090/docs

## Architecture

1. `main.py` - L'application FastAPI avec toutes les routes
2. `database.py` - Pour la connexion à la base de données, la création des tables et des sessions de base de données
3. `schemas.py` - Pour les schémas Pydantic qui sont utilisés pour la validation des données entrantes et sortantes et pour la documentation automatique de l'API avec Swagger et ReDoc
4. `services.py` - Pour les fonctions qui utilisent les sessions de base de données pour effectuer des opérations sur la base de données
5. `tasks.py` - Fonctions utilitaires
6. `models.py` - Pour les modèles SQLAlchemy qui sont utilisés pour la création des tables de base de données
