<div align="center">

<img src="assets/bot_image.jpg" alt="QUEEN AKUMA" width="320"/>

# QUEEN AKUMA

**Advanced multi-device WhatsApp bot**

![Version](https://img.shields.io/badge/version-3.6.3-red?style=for-the-badge)
![Commands](https://img.shields.io/badge/commands-3042-blue?style=for-the-badge)
![Baileys](https://img.shields.io/badge/Baileys-7.x-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node-%3E%3D%2020-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)

Owner: **INCONNU BOY SENSEI** - wa.me/554488138425
Channel: **INCONNU BOY SENSEI** - https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J

</div>

---

## Features
- **3,042 commands** (+ 2,879 aliases) across 67 categories (AI, downloaders, group admin, stickers, image tools, OSINT, economy, utility...)
- Plugin system (`command/` folder, drop a file and it loads)
- Anti-link, anti-badword, anti-delete, anti-edit, anti-call, anti-fake, anti-porn, welcome/goodbye, chatbot, auto-status, auto-read, auto-typing
- **Group Shield** (`.shield`): anti-forward, channel-forward, sticker, mention, tag-all, status-mention, virtex, phishing, toxic, custom words, bot, flood/spam, promote/demote guard — each with delete / warn / kick
- **Group Protection — 19 toggles**: antilink, antispam, antibug, antisticker, antiimage, antivideo, antiaudio, antivoice, antidoc, antimedia, antiforward, antibot, antilocation, antipoll, antivv, antiword, antitag, anticontact, antimention — toggle with `.antiX on`, action with `.antiaction delete|warn|kick`
- **Anti-Edit** (`.antiedit`): shows the original text when someone edits a message (Before / After)
- **Anti-Delete** (`.antidelete`, `.selfantidelete`): deleted messages recovered to owner DM
- **View-Once tools** (`.vv`, `.vv2`, `.setdetectvv`): view-once photos/videos revealed, auto-detect forwards them to owner
- **New in QUEEN AKUMA v3.6.3:** `.antibadword` fixed (custom words now work), `.antiporn` native rewrite (adult links blocked), `.antistickerwarn` native rewrite (warn mode + limit), `.aimod` AI auto-admin, `.sleepmode` real, group toggles owner/admin lock, rent manager (`.rentlist`, `.rentadd`), `.menu` never hangs (text fallback)
- Pairing-code login (no QR), Telegram pairing or website pairing — 3 ways, session id bhi chalta hai
- **DEX session IDs work:** `INCONNU-BOY-SENSEI~...`, `Dex-Bot-md~...`, `QUEEN-AKUMA~...` (base64 or Mega link id)
- **1,130 restored community commands** run through a built-in compatibility layer (`lib/compat.js`) — loaded lazily, so start-up stays fast
- Speed: group-metadata cache (60s), media cache, no link-preview generation, configurable RAM guard (`MAX_RAM_MB`)
- SQLite by default; MongoDB / PostgreSQL / MySQL optional
- Auto-follows the **INCONNU BOY SENSEI** channel on connect (turn off with `AUTO_FOLLOW_CHANNEL=false`)

---

## Setup (Termux / VPS / Panel)
```bash
git clone https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA.git
cd QUEEN AKUMA
cp .env.example .env        # edit: PAIRING_NUMBER or SESSION_ID
npm install --legacy-peer-deps
npm start
```
Pairing code console me aayega → WhatsApp → Linked devices → *Link with phone number*.

Requirements: **Node.js ≥ 20**, `ffmpeg` (stickers/audio), git.

### One-click deploy

[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA)

### Docker
```bash
docker build -t queen-akuma .
docker run -d --restart unless-stopped --env-file .env -v $(pwd)/session:/app/session queen-akuma
```

### Session ID format
`SESSION_ID="INCONNU-BOY-SENSEI~<id>"` (also `Dex-Bot-md~…` / `QUEEN-AKUMA~…`)
Get it with: `base64 -w0 session/creds.json` after your first login.

## Assets
- Menu photo/video are hosted by URL (Catbox) so the zip stays small — `settings.js` me `menuImage` / `menuVideo` badlo, ya owner command `.customize` se
- `assets/` — bot photo (used by `.menu` and `.script`)

## Config
- `settings.js` → bot name, owner, prefixes, channel, timezone
- `.env` → session / pairing number / API keys
- `data/owner.json` → extra owner numbers

Key `.env` variables: `GEMINI_API_KEY` (free, AI Studio — `.demonai`, `.vision`, `.aimod`), `GROQ_API_KEY` (free, Voice Mode), `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OWNER_ID` (Telegram pairing).

---

## Command categories
| Category | Count | Examples |
|---|---|---|
| Restored | 1130 | `.eliteai`, `.play`, `.sticker`, `.menu`, `.ping` … |
| Tools | 302 | `.base64`, `.convert`, `.fetch`, `.qr`, `.shorturl` … |
| Misc | 219 | `.addmoney`, `.calo`, `.hotak`, `.cekswgc` … |
| Owner | 166 | `.anticall`, `.antidelete`, `.antiedit`, `.autoreact`, `.broadcast`, `.restart` … |
| Group | 113 | `.ban`, `.add`, `.groupinfo`, `.hidetag`, `.warn`, `.kick` … |
| Fun | 85 | `.8ball`, `.fact`, `.flirt`, `.hack`, `.joke` … |
| Ai | 81 | `.demonai`, `.gemini`, `.gpt`, `.imagine`, `.vision`, `.aimod` … |
| Game | 70 | `.tictactoe`, `.trivia`, `.math`, `.dare` … |
| EliteApi | 62 | `.eliteai`, `.eliteplay`, `.elitegpt`, `.eliteimage` … |
| Fei-Anime | 53 | `.anilist`, `.animesearch`, `.toanime`, `.waifu` … |
| Osint | 52 | `.ipinfo`, `.domain`, `.phoneinfo`, `.bin`, `.username` … |
| Download | 36 | `.play`, `.song`, `.ytmp3`, `.ytmp4`, `.tiktok`, `.mediafire`, `.modapk` … |

Use `.menu` for the full list, `.menu <command>` for details.

## Group protection in v3.6.3
| Old / duplicate names | Now |
|---|---|
| antilink, antilink2, antilinks, antilinkalt, antilinkx, group-antilink | `.antilink` (19-toggle engine) |
| antibadword, antiwords, antitoxic, group-antitoxic | `.antibadword` (fixed v3.6.3), `.antiwords`, `.antitoxic` |
| antiforwarded, antiNewsletter, antisticker, antimention, antistatus, antigm, antigroupmention, antitagsw, antitagall, antiTag | `.shield` features + `.antiforward`, `.antisticker`, `.antimention`, `.antigm` |
| antiflood, AntiSpam, group-antispam, group-antivirtex, tools-antilinkphising | `.antiflood`, `.antivirtex`, `.antiphishing` |
| antiBot, anti-unadmin, group-antiunadmin | `.antibot`, `.antidemote` / `.antipromote` |
| anti-delete, antidelete, antigsmsdelete | `.antidelete` + `.selfantidelete` |
| anticall | `.anticall` |
| anti-once, antivv, anti-vv, antivvalt | `.vv` / `.vv2` view-once tools |
| antifake | `.antifake` |
| anti-mod (edit part) | `.antiedit` |
| anti-porn (legacy wrapper) | `.antiporn` — native rewrite in v3.6.3 (adult links blocked, no key needed) |
| antistickerwarn (legacy wrapper) | `.antistickerwarn` — native rewrite in v3.6.3 (warn mode + limit, shared with `.warnlimit`) |
| anticolong, tools-antidana | **not included** (tied to another bot's branding / payment-scam list) |

---

## Imported plugins (restored)
Some restored commands reply in their original wording and depend on public third-party APIs that can change or go offline; when one stops working it is the API, not the bot. NSFW, spam (bomb, stress, fishing, nekopoi) and session-touching plugins were deliberately left out. No new game features by decision — the bot stays focused on utility, groups and AI.

## Notes
- `SESSION_ID` is decoded locally; only a `DEX-...~<id>#<key>` Mega link makes the bot download your own session file from Mega.
- `.update` is disabled until you set `UPDATE_ZIP_URL` to **your own** repo zip.
- Some commands call public third-party APIs. If one stops working it's the API, not the bot.
- `.song` / `.video` use `@distube/ytdl-core` locally; YouTube may block datacenter IPs — use a residential/Termux host if so.
- `.aimod` AI classify needs `GEMINI_API_KEY` (free from AI Studio) — without it, flood protection still works and AI classify stays off.
- `.menu` falls back to a text menu if the menu photo/video host is unreachable from your server.

---
<div align="center">Made with love by <b>INCONNU BOY SENSEI</b> · <b>INCONNU BOY SENSEI</b> · Star this repo if QUEEN AKUMA helps you!</div>
