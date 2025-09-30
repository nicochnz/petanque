# Terrains de Pétanque 🎯

Application collaborative permettant aux utilisateurs de découvrir, partager et noter les terrains de pétanque près de chez eux.

## 🌟 Fonctionnalités

- 🔍 Carte interactive des terrains de pétanque
- 📍 Géolocalisation automatique
- 📸 Ajout de photos et descriptions des terrains
- ⭐ Système de notation des terrains
- 🔐 Authentification via Google
- 📱 Interface responsive et moderne
- 🎨 Design aux couleurs de la pétanque (ambré/orange)

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **React Leaflet** - Intégration de cartes interactives
- **NextAuth.js** - Authentification OAuth

### Backend
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **Upstash** - Rate limiting et Redis

### Services externes
- **Google OAuth** - Authentification
- **OpenStreetMap** - Données cartographiques
- **Cloudinary** - Stockage des images

## 🚀 Installation

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
cd petanque
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```
Remplir les variables suivantes dans `.env.local` :
```env
MONGODB_URI=votre_uri_mongodb
NEXTAUTH_SECRET=votre_secret
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
UPSTASH_REDIS_REST_URL=votre_url_upstash
UPSTASH_REDIS_REST_TOKEN=votre_token_upstash
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

4. Lancer l'application en développement
```bash
npm run dev
```

## 📦 Structure du projet

```
petanque/
├── src/
│   ├── app/                 # Pages et composants Next.js
│   ├── components/          # Composants réutilisables
│   ├── hooks/              # Hooks personnalisés
│   ├── lib/                # Utilitaires et configurations
│   └── models/             # Modèles Mongoose
├── public/                 # Assets statiques
└── ...
```

## 🔒 Sécurité

- Rate limiting avec Upstash pour protéger les API
- Authentification OAuth sécurisée
- Validation des données côté serveur
- Protection contre les injections MongoDB

## 📊 Base de données

### MongoDB Collections
- **Terrains**
  - Informations sur les terrains
  - Photos
  - Notes et commentaires
  - Géolocalisation

### Upstash Redis 
- Rate limiting pour les API
- Cache des données fréquemment utilisées

## 🔄 Workflow de développement

1. Créer une branche pour une nouvelle fonctionnalité
2. Développer et tester localement
3. Créer une Pull Request
4. Code review et merge

## 📝 Licence

MIT

## 👥 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.