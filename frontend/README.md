# Frontend (JavaScript pur)

Interface de gestion de location de voitures : HTML + JavaScript (modules ES), sans React ni npm.

## Structure

```
frontend/
├── index.html
└── js/
    ├── config.js        adresse de l'API (à modifier au déploiement)
    ├── api.js           requêtes fetch (GET, POST, PUT, DELETE)
    ├── outils.js        echapper() et argent()
    ├── app.js           menu et navigation
    └── pages/
        ├── tableau-de-bord.js
        ├── clients.js
        ├── categories.js
        ├── voitures.js
        ├── disponibilites.js
        ├── reservations.js
        └── paiements.js
```

## Lancer en local

Les modules ES ne fonctionnent pas en double-cliquant sur `index.html` : il faut un petit serveur.

```bash
cd frontend
python -m http.server 5500
```

Puis ouvrir http://localhost:5500 (l'API Django doit tourner sur le port 8000).

Avec VS Code, l'extension **Live Server** (clic droit sur `index.html` > Open with Live Server) fonctionne aussi.

## Déploiement (Render, Static Site)

- Root Directory : `frontend`
- Build Command : (vide)
- Publish Directory : `.`
- Dans `js/config.js`, remplacer `API_URL` par l'adresse de l'API déployée, par exemple `https://ton-api.onrender.com/api`.
