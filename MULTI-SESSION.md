# QUEEN AKUMA — Mode multi-session

Il n'y a plus de bot principal. Chaque numéro WhatsApp est un **bot à part entière** :

| | Propre à chaque bot |
|---|---|
| Process | 1 process Node par bot. Si un bot plante ou dépasse sa RAM, il est le seul à redémarrer. |
| Session | `instances/<numéro>/session/` |
| Données | `instances/<numéro>/data/` : sudo, premium, warnings, antilink, réglages de groupe, mode public/privé, etc. |
| Propriétaire | Par défaut, le numéro du bot lui-même. On peut le changer depuis le panel ou avec `.setownernumber`. |
| Réglages | `.setbotname`, `.customize`, préfixes, image du menu… ne concernent que ce bot. |
| Plugins | Un plugin installé par un bot n'apparaît pas chez les autres. |
| Base / Telegram / GitHub | Rien n'est partagé. Ces réglages se mettent par bot (voir plus bas). |

Le **code**, lui, est commun à tous les bots, grâce à des liens symboliques. Une mise à jour du code s'applique donc à tous les bots au prochain redémarrage.

## Démarrer

```bash
npm install
npm start              # = node manager.js
```

Ouvre `http://<ton-serveur>:5000/`. Le mot de passe est celui de `ADMIN_PASSWORD` ; le nom d'utilisateur n'est pas vérifié. Ensuite :
1. Saisis le numéro du bot, puis clique sur **Ajouter un bot**.
2. Le code d'appairage s'affiche. Dans WhatsApp : Appareils connectés → Connecter un appareil → Connecter avec un numéro de téléphone.
3. Pour ajouter d'autres bots, recommence.

Le panel permet aussi de démarrer, arrêter ou redémarrer un bot, de refaire l'appairage, de changer le propriétaire, de voir les logs et de supprimer un bot.

## En ligne de commande

```bash
node manager.js add 5511999999999            # le propriétaire est le bot lui-même
node manager.js add 5511999999999 5511888888888   # avec un autre propriétaire
node manager.js list
node manager.js remove 5511999999999         # garde le dossier instances/…
node manager.js remove 5511999999999 --purge # supprime aussi la session et les données
node manager.js import 5511999999999         # reprend l'ancienne session unique (./session + ./data)
```

Si le manager est déjà lancé, il prend en compte ces changements tout seul : il surveille `bots.json`.

## Variables (.env à la racine)

| Variable | Rôle |
|---|---|
| `ADMIN_PASSWORD` | Mot de passe du panel |
| `PORT` | Port du panel (5000 par défaut) |
| `MAX_BOTS` | Nombre maximum de bots (0 = illimité) |
| `PUBLIC_PAIRING=true` | Ouvre la page `/pair`, où chacun peut créer son propre bot avec son numéro (limite : 3 demandes par IP toutes les 10 min) |
| `BOT_MAX_RAM_MB` | RAM maximum par bot ; au-delà, le bot se relance |
| `BOT_PORT_BASE` | Premier port interne attribué aux bots (6100 par défaut) |

Les clés d'API (Gemini, Groq…) sont partagées. Par contre, `SESSION_ID`, `MONGO_URL`, `POSTGRES_URL`, `TELEGRAM_BOT_TOKEN`, `GITHUB_TOKEN`, `OWNER_NUMBER`, `BOT_NAME`… **ne sont jamais partagés**. Pour en donner à un bot :
- soit dans `instances/<numéro>/.env` ;
- soit dans `bots.json`, champ `"env": { "MONGO_URL": "..." }` du bot.

## Ce qui a changé dans le code

- `manager.js` + `manager/` : le superviseur, le panel et la page d'appairage public.
- `index.js` : envoie le code d'appairage et l'état de connexion au manager ; ne lance plus les sous-bots `.addbot`.
- `.addbot` et `.rentbot` : désactivés en mode multi-session (les bots se gèrent depuis le panel).
- `npm run start:single` lance toujours l'ancien mode mono-bot (`node index.js`).

## Coût

Chaque bot est un process complet : compte environ 150 à 300 Mo de RAM par bot. Sur un VPS de 2 Go, 5 ou 6 bots est un maximum raisonnable.
