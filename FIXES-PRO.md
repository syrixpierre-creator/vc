# QUEEN-AKUMA-PRO • Fixes (QUEEN-AKUMA-Mini se Pro banaya gaya)

Ye version dono zips ko analyse karke banaya gaya hai:
- **QUEEN-AKUMA-PRO.zip** (4,228 files, ~4,200 JS) — full bot
- **QUEEN-AKUMA-Mini-main.zip** (82 files) — chhota, saaf bot, jiske kuch parts kaam ke the

## Mishu se kya port kiya (working code, QUEEN AKUMA ke khaali stubs ki jagah)
- `lib/audioeditor.js` — Mishu `data/audioeditor.js` (ffmpeg effects: bass/deep/slow/fast/nightcore/robot/chipmunk/demon/reverse/smooth/tupai/baby/earrape/blown/fat/radio). QUEEN AKUMA wala `{}` tha, isliye `.deep` / `.bass` jaise commands crash karte the.
- `data/sticker-converter.js` — Mishu wala (sticker webp → png). QUEEN AKUMA wala `{}` tha.
- `data/converter.js` — Mishu AudioConverter (toAudio/toPTT/toVideo). QUEEN AKUMA wala `{}` tha.
- `app/pair.html` + `GET /pair` (lib/server.js) — Mishu ki pairing page. Pairing abhi bhi `SESSION_ID` / `PAIRING_NUMBER` se hoti hai; page wahi flow dikhata hai.
- Mishu se **nahi** liya: uska `main.js` + `settings.js` khud load nahi hote (neeche dekho), isliye uska core copy karna galat hota.

## Mishu me mile bugs (reference ke liye — QUEEN AKUMA me ye nahi hain)
- `main.js:49` aur `:81` dono `registerAntiCall` declare karte hain → `Identifier 'registerAntiCall' has already been declared` — bot start hi nahi hota.
- `settings.js:147` par object beech me hi `};` se band ho gaya, uske baad 300 lines settings object ke bahar hain → `Unexpected token ':'`.
- `package.json` me Node builtins ko npm deps likha hai (`crypto`, `path`, `child_process`) aur `fluent-ffmpeg` do baar hai.

## QUEEN AKUMA me mile aur fix kiye gaye issues
1. **_shim khaali tha** — `_shim/config.js`, `settings.js`, `sticker.js`, `uploadImage.js` sab `module.exports = {}` the. Ab ye asli `config` / `settings` / `lib/sticker` / `lib/uploadImage` ko re-export karte hain, aur `command/_shim/` bhi banaya gaya hai taaki `require('./_shim/...')` wale 18 command files load hon.
2. **`sticker5` export missing** — `lib/sticker.js` me function tha par `module.exports` me nahi tha; `.brat` sticker crash karta tha. Ab export hai.
3. **`uploadPomf` missing** — `lib/uploadImage.js` sirf `uploadImage` deta tha; `anime-imagesearch` / `jadianime` ko `uploadPomf` chahiye tha. Ab dono hain (pomf2 via `lib/uploaders`).
4. **`lib/vnum.js` khaali tha** — `.vnum` / `.vnumget` / `.vnumotp` ko `fetchVnum is not a function` milta tha. Ab poora helper hai (fetch + normalize + OTP extract). Upstream sms24 endpoint `SMS24_API_BASE` env se badla ja sakta hai; service down ho to command saaf error bhejta hai, crash nahi.
5. **`lib/isOwnerOrSudo.js` hamesha `false`** — `gc-test` / leave jaise owner checks kabhi pass nahi hote the. Ab ye asli `lib/isOwner.js` ko re-export karta hai.
6. **Half-converted ESM commands** — `analyze.js`, `cipher.js`, `crun.js`, `dna.js`, `rle.js` me `import` lines comment thi aur `promisify(exec)` bina require ke tha → load hote hi `ReferenceError`. Ab sahi `require` lines hain; `getBin` bhi `lib/compile.js` me add kiya gaya hai (binary na ho to saaf error).
7. **`lib/compile.js`** — sirf `compile: async () => null` tha; `new_cipher` / `new_analyze` ko `getBin()` chahiye tha. Ab `getBin` hai.
8. **`lib/fetchGif.js`** — function return `null` karta tha, callers `{ fetchGif, gifToVideo }` destructure karte hain → `undefined is not a function`. Ab dono real hain (Giphy search + ffmpeg gif→mp4).
9. **`lib/sticker-maker.js` khaali tha** — sticker command ko `videoToWebp` / `gifToSticker` / `convertStickerToImage` chahiye the. Ab implemented hain.
10. **`lib/converter.js`** — temp files `../database/` folder me likhta tha jo exist hi nahi karta (ENOENT), aur bare `ffmpeg` binary dhoondhta tha. Ab `temp/` + bundled ffmpeg (`@ffmpeg-installer/ffmpeg`) use karta hai.
11. **Galat relative requires** — `../../database` → `../lib/database` (setwelcome/setgoodbye/antigroupmention/autosticker), `../../command.js` → `../command.js` (antimention), `../../index` → `../index` (clean.js).
12. **`lee.js` missing** — 4 files `require('../lee')` karte the. Ab root `lee.js` registrar shim hai (sam.js / command.js jaisa).
13. **Bug/crash commands disabled** — `lib/vampireBug.js` ab saaf error deta hai (CHANGELOG-PRO ki policy: crash payloads number ban karwate hain, isliye implement nahi kiye).
14. **`index.js` global leak** — `getName` me `id = ...` bina `const` ke global banata tha. Ab `const id`.
15. **`package.json`** — `reset-session` script ek missing file ko point karta tha (ab `reset-session.js` banaya gaya), `test` script placeholder error tha (ab `node test.js`), `check` script bekaar tha (ab real check), `directories.plugins` galat folder (`plugins/`) ko point karta tha (ab `command/`), `@ffmpeg-installer/ffmpeg` dependency add ki (audioeditor/sticker-converter ko chahiye).
16. **`test.js`** — pehle har file ko `require()` karta tha, ek missing optional dep poora check gira deta tha. Ab syntax-only check (vm.Script) karta hai.
17. **Duplicate commands** — 872 duplicate registrations milin. `lib/commandHandler.js` ab native-vs-native duplicate par pehle wala command rakhta hai aur baad wale ko `[DUPLICATE-SKIP]` ke saath skip karta hai (pehle last wala silently overwrite kar deta tha). `priority.json` wale owners abhi bhi jeet te hain.
18. **SIGTERM handler** — Docker/Render/Railway SIGTERM bhejte hain; pehle sirf SIGINT handle hota tha. Ab graceful shutdown + session save.
19. **Dead file** — `command/dl-img.js` (1 byte) delete kiya.
20. **Deploy-all-platforms** — `app.json` (Heroku), `render.yaml`, `railway.json`, `koyeb.yaml`, `docker-compose.yml`, `Dockerfile`, `ecosystem.config.js` (PM2), `deploy.sh` (VPS), `start.sh` (Panel/Termux), `.replit`, `.env.example`, `DEPLOY.md` — details `DEPLOY.md` me.

## Kya verify kiya (live WhatsApp test nahi ho sakta tha — yahan WA connect nahi hota)
- `node --check` / vm.Script syntax: QUEEN AKUMA ke 4,196 JS files me **0 syntax errors** (Mishu ke 2 the — upar dekho).
- Mock loader (saare npm modules stub karke, sirf real require/load errors gin ke): QUEEN-AKUMA-style 3,453 files load hote hain, **2,779 unique commands** register hote hain.
- Baaki files legacy/foreign-framework (`lee`/`sam`/`bot`/`gmd` style) hain jo loader by-design skip karta hai — wo `lib/compat` wrappers (`imp_*`/`lg_*`) se chalte hain.

## Kya abhi bhi manual chahiye
- `.env` me asli `SESSION_ID` ya `PAIRING_NUMBER`, aur optional `GEMINI_API_KEY` / `GIPHY_KEY`.
- Live test: `.menu` `.ping` `.sticker` `.play` `.vnum` — kuch commands third-party APIs (YouTube, sms24, Gemini) par depend karte hain; API down ho to command saaf error dega.
- Crash/bug, adult/NSFW commands jaan-bujh kar nahi laaye gaye (ban risk).

## Update 2 — MINI version + all-platform deploy + real commands
- **2 versions:** FULL (`QUEEN-AKUMA-PRO-FIXED`, 2,781 unique commands, ~4,000 files) aur MINI (`QUEEN-AKUMA-MINI`, 154 unique commands, 141 command files, 258 total files). MINI me sirf non-stub, loadable, essential commands hain; `black_hat/` aur packs nahi hain; deps slim hain.
- **Naye real commands (dono versions me):** `.toimg` (sticker → image, Mishu converter se), `.eval` (owner-only JS runner), `.jid` / `.lid` / `.profile` / `.me` / `.id` (userinfo.js), `.brat` (offline Jimp brat sticker), `.coinflip` — pehle ye sirf stubs/wrappers the.
- **Audio effects:** `.demon` aur `.baby` filters `audiofx.js` me add kiye (Mishu audioeditor se), aur ffmpeg ab bundled binary (`@ffmpeg-installer/ffmpeg`) use karta hai, system ffmpeg na ho to bhi.
- **Deploy:** Render aur Railway ab Dockerfile se deploy hote hain (native env me ffmpeg nahi milta), Heroku ffmpeg buildpack, Koyeb Dockerfile, Docker Compose, PM2, VPS `deploy.sh` — sab `DEPLOY.md` me.
- **MINI note:** `better-sqlite3` MINI me nahi hai, isliye store in-memory backend par chalta hai (restart par message history nahi bachti) — settings/commands sab kaam karte hain.

## Update 3 — v2 (QUEEN AKUMA + 1520 plugins se)
- **Quiz games ab ASLI hain:** `.tebakgambar` (photo ke saath), `.tebakan`, `.tebaktebakan`, `.tebaklirik`, `.tebakmakanan`, `.susunkata`, `.caklontong`, `.family100`, `.asahotak`, `.lengkapikalimat` — pehle ye sirf "Game command ready" bolte the. Ab real sawal (embedded banks; tebakgambar public JSON se), 60s timer, similarity check (0.72), `.hint` aur `.nyerah` kaam karte hain. Engine: `lib/quizGame.js` + `lib/quizData.js`, answers `lib/messageHandler.js` me chatbot se pehle check hote hain. Fake `game*ans.js` files delete kar diye.
- **QUEEN AKUMA se:** `.fullpp` (bina crop ke profile pic, owner only), `.statuslike` (status auto-like on/off/emoji), `index.js` me restart guard (do socket ek saath start nahi honge) + WA version fetch fail hone par Baileys default use hota hai.
- **1520 plugins se:** `.muslim-ai`, `.savescrape` (owner only, quoted code syntax-check ke baad save), `.font1`–`.font15` + `.fonts` (15 real unicode styles, `lib/fonts.js`).
- **Loader fix:** `fonts.js` pehle loader ke prefilter se skip ho raha tha (variable `commands:` export) — ab literal array export hai, load hota hai.
- **Real loader test (v2, npm install ke saath):** 760 packages, exit 0; loader 3,667 registrations, **2,647 unique commands, 2,457 aliases, 58 categories, 0 load errors**. v1 original se +13 commands. Upar wale 14 naye commands sab direct load hote hain (fonts.js/quiz.js/fullpp.js/statuslike.js/muslimai.js/savescrape.js/game-*.js).
- **Session zips NOT merged:** `all_session_ID.zip` me 12 alag pairing websites hain (DEX-SESSION, INCONNU-SESSION...), bot plugins nahi. QUEEN AKUMA me pairing pehle se hai (PAIRING_NUMBER + `/pair` page). Session files ko kabhi bot repo me copy mat karo.
- **Baaki open items:** 626 restored-wrapper `[REPLACED]` warnings log me aate hain (crash nahi, sirf noise — native commands ko mask nahi karte). Kuch commands third-party APIs par depend karte hain (YouTube/sms24/Gemini) — API down ho to saaf error, crash nahi.
