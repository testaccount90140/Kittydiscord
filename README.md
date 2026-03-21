# 🤖 Smash or Pass Bot

Bot Discord qui gère automatiquement le salon **Smash or Pass** :
- Supprime tout message qui n'est pas une photo/vidéo
- Réagit avec ✅ et ❌ sur chaque post valide
- Crée un fil au nom de l'auteur
- Poste un message de prévention dans le fil
- Configure le mode lent automatiquement

---

## 🚀 Installation

### 1. Prérequis
- [Node.js 18+](https://nodejs.org/)

### 2. Cloner / dézipper le projet
```bash
cd smash-or-pass-bot
npm install
```

### 3. Configurer le token
```bash
cp .env.example .env
```
Ouvre `.env` et colle ton **token de bot** Discord :
```
DISCORD_TOKEN=MTQ3...ton_vrai_token
```

> 🔒 Ne partage JAMAIS ton token. Si tu l'as exposé par accident, régénère-le immédiatement dans le Portail Développeur Discord.

### 4. Lancer le bot
```bash
npm start
```

---

## ⚙️ Permissions requises pour le bot

Dans le **Portail Développeur Discord → OAuth2 → URL Generator**, coche ces scopes et permissions :

**Scopes :**
- `bot`

**Permissions :**
- `Read Messages / View Channels`
- `Send Messages`
- `Manage Messages` ← pour supprimer les messages invalides
- `Add Reactions`
- `Create Public Threads`
- `Send Messages in Threads`
- `Manage Threads`
- `Manage Channels` ← pour configurer le mode lent

### Intents (dans la section Bot)
- ✅ **Message Content Intent** uniquement

---

## 🏠 Configuration du salon Discord

Dans ton salon `smash-or-pass`, configure manuellement les permissions suivantes via les paramètres du salon :

**Rôle @everyone :**
- ✅ Voir le salon
- ✅ Envoyer des messages (nécessaire pour poster les photos)
- ✅ Joindre des fichiers
- ✅ Envoyer des messages dans les fils
- ❌ Envoyer des messages TTS
- ❌ Gérer les messages
- ❌ Mentionner @everyone

---

## 📁 Structure du projet

```
smash-or-pass-bot/
├── bot.js          ← Code principal du bot
├── package.json
├── .env            ← Ton token (à créer, ne pas commit)
└── .env.example    ← Modèle
```
