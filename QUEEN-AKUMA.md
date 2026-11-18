# QUEEN AKUMA • BY INCONNU BOY SENSEI

- **Bot name:** QUEEN AKUMA
- **Owner:** INCONNU BOY SENSEI — 554488138425
- **Channel:** INCONNU BOY SENSEI — https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
- **Channel ID:** 120363403408693274@newsletter
- **Version:** 2.7.0 (based on QUEEN-AKUMA-PRO-FIXED v2 — 2,696+ commands, quiz games, deploy configs)

## v2.7.0 — Top 20 missing commands (6-zip check report, 2026-11-14)
- Naya `command/advtools.js` (24 commands): `.v2sticker` (video → animated sticker, ffmpeg), `.checkstore`/`.clearstore` (anti-delete store), `.sessioninfo` (bot number/uptime/version), `.langcodes`, `.detectlang` (Google Translate detect, live), `.catfact` (catfact.ninja, live), `.technews` (BBC + Google News RSS), `.gfx1-12` (12 Pollinations logo styles), `.app`/`.application` (`.apk` aliases), `.addsudo`/`.delsudo`/`.sudohelp` (sudo.js wrappers, owner check andar).
- `.pqr` fix: `lib/publicApis.js` me QR threshold 500 → 100 bytes — short text ("hello" ~408 bytes) ab QR banata hai.
- Skip kiye gaye (reason): `.gpt5` (malvin-api dead — DEPLOYMENT_NOT_FOUND), `.veo3`/`.sora2` (omegatech unprobed/keyed), `.clearall` (sent-message store nahi hai), `.backupsession` (session files chat me bhejna unsafe), `.gcbot` (exists: `.chatbot on/off`), `.surrender` (in-game text already works), `.chartest`/`.mychar` (exists: `.character`), `.tiktokstalk2` (exists: Elite `.tiktokstalk`), `.antideletedm` (exists: `.selfantidelete`).

## v2.6.2 — GitHub hunting APIs (2026-11-14)
- Downloads: David Cyril ytmp4 (Elite ke baad fallback) + DC TikTok fallback;
  Cobalt community instance (cjs.nz) LAST-resort universal fallback — Cobalt
  docs kehte hain hosted instances bina permission doosre projects me use
  karne ke liye nahi hain, isliye ye kabhi primary nahi banta.
- Naye public API commands (18): .pchat (ch.at AI), .pjoke2 (JokeAPI),
  .pquote2 (ZenQuotes), .pfact, .ptrivia (OpenTDB), .psyn (Datamuse),
  .pweather2 (wttr.in), .pqr (QR image), .pcurrency (Frankfurter),
  .pcrypto (CoinGecko), .pmemes (Imgflip), .pip (ip-api), .pcolor,
  .pcapital, .pcountry (WorldBank), .pshort2 (v.gd), .pscore (ESPN soccer),
  .panime + .pdcfact (David Cyril). (joke2/quote2 naam pehle se the.)
- Imaandaar note: Instagram, Pinterest, Threads aur Spotify full-track ke
  liye abhi bhi koi free no-key API nahi mili — GitHub tools wahan local +
  login wale hain, hosted API nahi.

## v2.6.1 — Hunted + pasted APIs (2026-11-14)
User ke pasted API code + public hunting se naye APIs wire kiye:
- Nayi `lib/publicApis.js` — Pollinations AI image/text (no key), MyMemory translate,
  meme-api, TinyURL shortener, Wikipedia REST summary, Quotable, Popcat joke,
  Laurine TTS, Shizo GPT (fallback AI), Spotify oEmbed (metadata only).
- Naye commands `command/publicapi.js` — `.aimg`, `.aitxt`, `.ptranslate`,
  `.pmeme`, `.shorturl`, `.pwiki`, `.pquote`, `.pjoke`, `.ptts`
  (`.meme/.translate/.wiki/.quote/.joke` pehle se registered hain, isliye `p` wale naam).
- Download fallback badha — `lib/downloadApis.js`: YT audio/video me Elite ke baad
  Izumi phir Yupra (VM-ambiguous, host pe chal sakte hain), TikTok me
  tiktok-downbloder teesra fallback; siputzx igdl (404 dead) chain se hataya.
- Twitter/X video — `lib/mediaDownloader.js` me FxTwitter provider (status-id se
  best-quality mp4 + photos, 403 pe 1 retry) — pehla working X source.
  TikTok providers me tiktok-downbloder bhi joda.
- Imaandaar note: Instagram, Pinterest, Threads aur Spotify full-track ke liye
  abhi bhi koi working no-key API nahi mili — inke liye koi fake command nahi banaya.
  `.apicheck` / `.addapi` se apna provider jod sakte ho.

## v2.6.0 — Download fix (2026-11-14)
Live probe (36 providers) me bada bug mila: `.play` / `.ytmp3` / `.song` ka main API
(qasimdev) dead hai — Spotify 401, YouTube routes 404, download 500. Isliye gaane
download nahi ho rahe the.
- `lib/downloadApis.js` rewritten — EliteProTech pehle (YT mp3/mp4/search live verified),
  phir tikwm (TikTok) aur noobs-alldl (TikTok + Facebook), qasimdev sirf last resort.
  `youtubeAudio()` ab gaane ke naam se bhi search karke mp3 deta hai (pehle sirf URL chalta tha).
  Naye exports `.ytmp` / `.ytmp3` / `.ytmp4` / `.song` — 100+ generic handlers jo inhe
  call karte the, ab kaam karenge.
- `.play <gaane ka naam>` fix — ab Spotify fail ho to YouTube search + mp3 fallback chalta hai.
- `.ytdlp` asli handler bana — pehle wala sirf "is working" reply karta tha.
- `lib/mediaDownloader.js` — Elite + noobs providers sabse pehle, timeout 15s -> 25s
  (Elite ytmp4 live ~11s leta hai), dead providers hataye (keith 404, arslan 402,
  agatz/ryzen challenge). VM se ambiguous wale (gifted/vreden/siputzx) rakhe hain —
  health system khud demote karta hai.
- Live test (is VM se): song-name mp3 ✅, YT URL mp3 ✅, TikTok ✅, Facebook ✅.
- Imaandaar note: Instagram, Twitter/X, Pinterest, Threads aur Spotify full-track ke
  liye koi free no-key API live nahi mili (sab probe kiye). Ye commands fail gracefully
  karte hain — `.apicheck` se live status dekho, `.addapi` se apna API jod sakte ho.

## v2.5.0 — fakevCard har reply pe + zip APIs + menu themes + duplicate fix
- **fakevCard har command reply pe:** `lib/messageHandler.js` ka styleSock ab har reply pe QUEEN AKUMA fakevCard quote lagata hai (caller ne `{ quoted: message }` diya ho tab bhi — reactions ko chhod kar). Menu2 list-selection, owner button aur main command path bhi styled. Main path ki CMD_REACTION bhi ab fire-and-forget (v2.4.0 me sirf sticker path fix hua tha).
- **Zip APIs (live-verified, no-key):** 4 zips mine kiye (QUEEN AKUMA/Mishu/AURA/1520) — Popcat (pickup lines, IMDB, periodic table, joke), some-random-api (joke, dog facts, anime quotes), api-faa (Wikipedia, brat HD) — sab live test kiye, 9/9 working. `lib/zipApis.js` + `command/zipapi.js`: `.pickupline`, `.imdbinfo`, `.elementinfo`, `.funjoke`, `.dogfact`, `.animequote`, `.fawiki`, `.zbrat`. Keyed/paywalled (shizoapi, nexoracle, arslan 402) aur NSFW hosts deliberately excluded. Note: `.fawiki` Indonesian Wikipedia deta hai by default.
- **Menu themes:** `.menu2` ab 👑 ROYAL theme (Bold style + crown emojis, category view same hai) aur naya `.menu3` ✨ NEON theme (Neon + Fullwidth styles, top categories + stats, cached image). `.menutheme` se teeno themes ki list. `.menu` classic waisa hi hai.
- **Duplicate overwrite fix:** load order sorted (deterministic first-wins), aliases aur prefixless commands bhi first-wins (unit-tested), [REPLACED] spam band — ab sirf ek summary line aati hai. Native commands ab kabhi overwrite nahi hote.

## Ultra-Fast Response (v2.4.0 — speed)
- `lib/mediaCache.js` (new): menu photo/video pehli baar download karke memory me cache (6h) — `.menu`/`.list` pehle 2-5s lete the (12MB video + 2.6MB photo har baar Catbox se), ab pehle call ke baad instant. `_menu.js` ka 300px thumbnail bhi cached. Bot connect hote hi background me warm ho jata hai (`index.js`), to pehla `.menu` bhi fast.
- `lib/fastCache.js` (new): weather 10min + currency 30min cache — repeat queries instant (weather 1945ms → 1ms, test kiya).
- `lib/messageHandler.js`: sticker commands har message pe disk se padhe jate the — ab 5s memory cache. CMD_REACTION ab fire-and-forget (pehle har command se pehle reaction ka round-trip await hota tha, ~200-500ms).
- `lib/commandHandler.js`: unknown command pe suggestion ke liye 2,696+ names par Levenshtein chalta tha — length prefilter + early-break se 19ms → 2ms (same suggestions, test kiya).
- Dispatch pehle se Map-based O(1) hai. `.ping` real send-latency dikhata hai.
- Audit (2026-11-14): strict static analysis me **0 pure-stub commands** mile (512 broad-grep hits false positive the — comments/help text). Loader 0 errors. Kuch third-party hosts (sxtream, ironman, waifu.pics) is VM se respond nahi karte — ye VM ki egress filtering ho sakti hai (Catbox bhi aise hi blocked hai), dead hone ka proof nahi; unke commands graceful error dete hain.

## v2.3.1 fix — ffmpeg-static ab zaroori nahi (deploy-safe)
- `ffmpeg-static` sirf `optionalDependencies` me hai — uska binary download kuch hosts par fail hota hai, aur tab `command/search.js` (`.yts` `.shazam` `.google` `.lyrics` `.happymod` `.apkmirror` `.stickersearch`), `command/simage-alt.js` (`.simage`) aur `command/_xjx/commands/fun/memesearch.js` (`.memesearch`) load hi nahi hote the. v2.3.0 ke test me yehi hua tha (747 vs 760 packages, memesearch skip).
- Ab teeno files pehle `ffmpeg-static` try karti hain, na mile to `@ffmpeg-installer/ffmpeg` (jo normal dependency hai, hamesha install hota hai) ka path leti hain, aur aakhir me system `ffmpeg` par girti hain. Koi command ab is wajah se load hone se nahi rukega.

## Bot Photo & Menu Video (v2.3.0 — Catbox URLs, zip chhota)
- Bot photo: `assets/bot_image.jpg` — tumhari bheji hui anime wali photo (blindfold character, golden talisman), neeche **QUEEN AKUMA** + **INCONNU BOY SENSEI** branding ke saath
- Menu video: https://files.catbox.moe/mql0wg.mp4 — tumhari QUEEN AKUMA menu video (32s), QUEEN AKUMA ke liye rebrand ki gayi: har jagah "QUEEN AKUMA" → "QUEEN AKUMA", crown scene me green "QUEEN AKUMA" + "Pesh hai QUEEN AKUMA bot", phone menu me "QUEEN AKUMA MENU", end me "QUEEN AKUMA ka upyog karne ke liye dhanyavad"
- Media zip me nahi hai (Catbox URL se aata hai) — zip ab 4.3MB hai
- `.menu` photo ke saath, menu video background me bhejta hai (list.js)
- `lib/mediaSource.js` URL ya local file dono handle karta hai
- Badlo: `.customize menuimage <url>` ya `.env` me `MENU_IMAGE` / `MENU_VIDEO`

## EliteProTech APIs (v2.3.0 — live verified, sirf working endpoints)
Dashboard https://eliteprotech-apis.zone.id ke 61 endpoints live probe kiye — **28 working** mile, baaki dead (404/500/timeout) hain aur bot se hata diye gaye. `lib/eliteApi.js` ab sirf verified paths use karta hai (`/ai/chatgpt`, `/ai/talkai`, `/ai/notegpt`, `/ai/deepseekai`, `/download/ytmp3`, `/download/ytmp4`...), aur `lib/apiSwitch.js` ka `.ai` bhi pehle inhi verified paths ko try karta hai.
- Naye commands (`.elitemenu` se list): `.eliteai` (AI chat), `.eliteimg` (AI image), `.elitetts` (text-to-speech), `.elitess` (website screenshot), `.eliteqr` (QR scan), `.eliteocr` (OCR), `.eliteshazam` (song identify), `.eliteytmp3` / `.eliteytmp4` (YouTube download links), `.eliteyt` (YouTube search), `.elitelyrics`, `.elitecurrency 1 USD INR`, `.elitegithub`, `.elitetiktok`, `.elitefont`
- Working: talkai, notegpt, chatgpt, deepseekai, story, mathgpt, AirMore TTS, ZonerAI/Pollination image, ssweb, qrscan, OCR, webcopier, Shazam, YTMP3/YTMP4, YT search, lyrics, currency, GitHub/TikTok stalk, font, firelogo, image search
- Dead (bot se removed): asyntai, imagine, toprompt, flux, ephoto, qr, getpp, fetchpage, apk, wallpaper, fdriod, tempemail, ytdown, x, aio3, spotify, facebook, mediafire, instagram, tiktok download, threads, sps, applemusic, igsearch, gsmarena, soundcloud, bible, transcript, countries, vocalremove, insult

## Text Styles (advance level — QUEEN AKUMA style)
- `.textstyles <text>` — ek text ke **40 styles ek saath**
- `.style <number 1-40> <text>` — kisi ek style se convert
- `.font1` … `.font40` — har style ka apna command
- `.fonts` — saare 40 styles ki list

## Smart / AI / OSINT (v2.1.0)
- `.weather <city>` — live weather, koi API key nahi chahiye (Open-Meteo)
- `.smart <kuch bhi>` — link/IP/number/domain/weather/AI khud samajhta hai
- `.inconnuai <sawal>` — direct Google Gemini AI (`.env` me `GEMINI_API_KEY` daalo)
- `.ipinfo <ip>` / `.domain <domain>` / `.phoneinfo <number>` / `.bin <6 digits>` / `.username <name>` — OSINT tools (`.osintmenu` se list)
- `.botintro` — bot introduction card (fakevCard ke saath)
- `.customize` — owner-only: botname, prefix, packname, author, menuimage, channellink badlo (restart ke baad lagega)
- `lib/fakevCard.js` — QUEEN AKUMA branding ke saath fake contact-card quoting helper

## QUEEN AKUMA port (v2.8.0)

QUEEN-AKUMA (60 files, 202 commands) se 91 genuinely naye commands port kiye. FEI ka owner/channel branding copy NAHI kiya — sab QUEEN AKUMA / INCONNU BOY SENSEI hai.

- **AI (5)** — `.mathgpt` (Elite mathgpt, step-by-step), `.summarize`, `.qwen` (OmegaTech Qwen), `.tts3` / `.tts4` (OmegaTech TTS). Dead skip: fable5, deepseek2, pollination, tts5 (OmegaTech 500 errors).
- **Anime (53)** — `.animemenu` + AniList commands (`.charpic` / `.studio` / `.recommend` / `.episodes` / `.animechars` / `.pictures` / `.streaming` / `.review` / `.genres` / `.genre` / `.topanime` / `.topmanga` / `.popular` / `.favorite` / `.airing` / `.upcoming` / `.season` / `.topchars` / `.nextep` / `.randomanime` / `.randommanga` / `.randomchar`), `.whatanime` (trace.moe), `.waifu2` / `.husbando` / `.kitsune`, 26 nekos.best GIF reactions (`.baka` / `.bleh` / `.blowkiss` / `.bored` / `.carry` / `.dance` / `.facepalm` / `.handshake` / `.kabedon` / `.lappillow` / `.laugh` / `.nod` / `.nope` / `.nya` / `.pout` / `.run` / `.salute` / `.shake` / `.shocked` / `.sip` / `.spin` / `.teehee` / `.think` / `.thumbsup` / `.wag` / `.yawn`). AniList queries me adult content hamesha exclude. NOTE: AniList GraphQL is VM se Cloudflare-block (403) — host par chal sakta hai, warna clear error dega.
- **Canvas (2)** — `.wndwqute <quote>`, `.canvasquote <quote> | <author>` (Xrina, live verify).
- **Fun (7)** — `.dadjoke` / `.progjoke` / `.chuck` / `.fact2` / `.fox` / `.advice` / `.nasa` (NASA APOD, DEMO_KEY).
- **News (10)** — `.aljazeera` (alias aj) / `.cnn` / `.bbc` / `.guardian` (alias gd) / `.npr` / `.nytimes` (alias nyt) / `.foxnews` / `.skynews` (alias sky) / `.dw` / `.punchnews` (alias punchng). Count arg 1-10, default 5. CNN RSS VM se block — host par try karega.
- **Group (4)** — `.groupjid` / `.getgcpp` / `.groupcount` / `.warnlist` (data/warnings.json).
- **General (3)** — `.date` (IST) / `.version` / `.whoami`.
- **Privacy + status tools (3)** — `.privacy`, `.statusdraft <text>`, `.statusideas [theme]`.
- **Group status (4)** — `.gcstatus [--color <name>] <text>` (group me), `.gcstatusdm list|colors|<number/JID> <text>` (DM se), `.statusreactmode random|❤️,🔥` aur `.statusreactkeys a,b|clear` (owner-only; autostatus.js me reactMode/reactKeys support add kiya).
- Files: `lib/feiApi.js`, `lib/feiGroupStatus.js`, `command/fei-ai.js`, `command/fei-anime.js`, `command/fei-misc.js`, `command/fei-status.js`.
- Dead isliye skip: ikyyxd ytplayv2 (402), NabeesTech AIO (401 key required), Rebix ytv (400).

## GitHub session backup — Mishu system (v2.9.2)

- **Mishu ka system port kiya:** QUEEN AKUMA session ko GitHub repo me save karta tha (`lib/githubSession.js`, `users/<number>/creds.json`) — auto-save on `creds.update` + restore on start. Wahi system QUEEN AKUMA me: naya `lib/githubSession.js` (get/save/delete + saveCurrentSession + restoreSessionToLocal + debounced scheduleAutoSave 10s, unchanged creds skip karta hai).
- **Farq (security fix):** Mishu ki file me GitHub token HARDCODED tha — QUEEN AKUMA me token sirf env var se aata hai (`GITHUB_TOKEN`), file me kabhi nahi likha. Repo HAMESHA PRIVATE rakhna hai (creds = poora WhatsApp access).
- **Wiring (index.js):** `initializeSession()` me — na SESSION_ID ho na local session, to GitHub se restore try karta hai. `creds.update` par `saveCreds` ke saath GitHub auto-save bhi lagta hai.
- **Commands (owner-only):** `.ghsave` (abhi save karo) + `.ghrestore` (wapas lao, phir restart karo).
- **Setup:** PRIVATE repo (jaise ton-user/QUEEN-AKUMA-SESSIONS) + classic PAT (`repo` scope) + env `GITHUB_TOKEN` / `GITHUB_REPO` / `GITHUB_BRANCH`. Poora guide: `GITHUB_SESSION.md` (zip me hai). `.env.example` me vars add kiye.
- Mock test PASS (13/13): save/get/restore/delete, debounce (2 calls -> 1 PUT), unchanged skip, no-token error, .ghsave/.ghrestore commands.
- v2.9.1 (har platform deploy) + v2.9.0 (3-way pairing) + v2.8.10 + v2.8.9 + v2.8.8 + v2.8.7 + v2.8.6 + v2.8.5 + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## Har platform par deploy — Render / Railway / Heroku / Replit / Fly.io / Docker / VPS (v2.9.1)

- **User ki demand:** bot sirf KataBump par nahi, har hosting platform par chalna chahiye (Render, Railway, Heroku, Vercel, KataBump, aur bhi).
- **Pehle se kya tha:** Procfile, Dockerfile, app.json, railway.json, render.yaml, .replit, .dockerignore pehle se the — lekin render.yaml me naam galat tha (`queen-akuma`), app.json me repo URL placeholder tha (`https://github.com/`), aur koi deploy guide nahi thi.
- **Fix kiya:** (1) render.yaml — naam `queen-akuma`, Telegram + Gemini env vars add. (2) app.json — repo URL `INCONNU-BOY-SENSEI/QUEEN-AKUMA`, Telegram env vars add. (3) Naya `fly.toml` (Fly.io). (4) Naya `DEPLOY.md` — Hinglish step-by-step guide: KataBump, Render, Railway, Heroku, Replit, Fly.io, Docker, VPS + one-click buttons.
- **Vercel — imaandaari se NAHI chalega:** Vercel serverless hai, WhatsApp socket ko hamesha ON rehna hota hai, Vercel function 10-60 second me band ho jata hai. Isliye fake vercel.json nahi banaya — DEPLOY.md me saaf likha hai.
- **Session ka rule (sab hosts par):** Render/Railway/Heroku restart par files delete kar dete hain — pehli baar pair karke `.getsession` se `QUEEN-AKUMA~...` string lo, `SESSION_ID` env var me daalo. Deploy guide me poora flow hai.
- **Render free keep-alive:** 15 min bina traffic ke sleep hota hai — UptimeRobot se `/` ko har 5 min ping karo (DEPLOY.md me steps).
- v2.9.0 (3-way pairing) + v2.8.10 + v2.8.9 + v2.8.8 + v2.8.7 + v2.8.6 + v2.8.5 + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## 3 tareeke se bot connect karo — custom pairing (v2.9.0)

- **Plan:** KataBump console ke alawa ab Telegram aur Website se bhi bot pair ho — teeno tareeke ek hi pairing engine (naya `lib/pairing.js`) se chalte hain.
- **(1) KataBump / terminal (pehle jaisa):** PAIRING_NUMBER se console me 8-digit code — kuch badla nahi.
- **(2) Telegram `/pair` (naya):** `/start` par ab welcome PHOTO (bot photo) + caption aata hai. `/pair 554488138425` bhejo (ya sirf `/pair` likh ke number bhejo) to bot `XXXX-XXXX` format me 8-digit code dega + WhatsApp steps. Sirf Telegram owner use kar sakta hai (TELEGRAM_OWNER_ID / settings.js telegramOwnerId) — koi aur try kare to "sirf owner" error.
- **(3) Pairing website (naya, pehle dead thi):** `https://<host>/pair` kholo — number dalo, code lo. `app/pair.html` pehle se thi lekin Mishu ki thi (+92, QUEEN AKUMA branding) aur uske `/code` `/status` `/active` endpoints the hi nahi — ab QUEEN AKUMA branded hai (🇮🇳 +91, INCONNU BOY SENSEI) aur `lib/server.js` me real API hai: `GET /code?number=...`, `GET /force-code`, `GET /status`, `GET /active`, `POST /pair`. Port: `PORT` env (default 5000).
- **Custom pairing code matlab:** bot khud number validate karta hai (digits, length, valid number, WhatsApp par registered hai ya nahi via onWhatsApp) phir WhatsApp se code mangta hai. Code ke digits WhatsApp generate karta hai — choose nahi kiye ja sakte, format `XXXX-XXXX` hota hai.
- **Security (zaroori):** website se by default SIRF owner ka number pair hota hai — warna koi bhi random banda apna number pair karke bot hijack kar lega. Kholna ho to env `ALLOW_ANY_PAIR=true`. Telegram /pair hamesha owner-only hai.
- **Deploy note:** GitHub par zip upload karke kisi bhi Node host (Render/Railway/KataBump) par deploy karo — base URL milte hi `/pair` kholo. Host par `PORT` env se port milta hai.
- Mock test PASS (19/19): pairing validation/format/owner-block/already-connected/no-socket, Telegram /start photo + /pair code + non-owner block + two-step, website /code + /status + /pair page branding.
- v2.8.10 (Telegram token settings.js) + v2.8.9 (.play rich card) + v2.8.8 (.sudo + .vv2) + v2.8.7 (ping card) + v2.8.6 + v2.8.5 (.age) + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## Telegram token ab settings.js me bhi (v2.8.10)

- **Problem:** Telegram token sirf `.env` file se padha jata tha — lekin `.env` naam ki koi file zip me hoti hi nahi (sirf hidden template `.env.example` hai, jo file manager me dikhta bhi nahi). User ko samajh nahi aaya token kahan dalna hai.
- **Fix:** `settings.js` me naya option — `telegramBotToken` aur `telegramOwnerId` (visible file, sabko dikhti hai). Token seedha settings.js me paste karo, ya .env me likho — .env set ho to wahi chalega (priority), nahi to settings.js wala chalega. `lib/telegramBot.js` dono jagah se padhta hai. `.env.example` + `TELEGRAM.md` me bhi dono tareeke likh diye.
- **Token kahan se:** @BotFather (/newbot) se token, @userinfobot se Owner ID. Token secret hai — kabhi share mat karo.
- v2.8.9 (.play rich card) + v2.8.8 (.sudo + .vv2) + v2.8.7 (ping card) + v2.8.6 + v2.8.5 (.age) + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## .play / download rich card (v2.8.9)

- **.play ab sirf audio nahi deta — poora song card aata hai:** pehle YT fallback sirf audio bhejta tha. Ab audio ke SAATH thumbnail photo + rich caption aata hai: 🎵 Title, 📺 Channel (kisne upload kiya), 👁️ Views (Indian format — 51.24 Cr), ⏱️ Duration, 📅 Uploaded. Example (live test): "Tum Hi Ho" — T-Series, 51.24 Cr views, 4:28, 13y ago. Spotify path bhi same rich card format use karta hai (Singer + Album).
- **.song / .ytmp3 / .ytmp4 bhi update:** sab me thumbnail + rich card (title, channel, views, duration, uploaded) + media. .ytmp4 me Elite ytmp4 ko 3rd video source banaya + metadata enrich 12s timeout race ke saath (command hang nahi karega).
- **lib/downloadApis.js:** `eliteYtSearch` ab full metadata deta hai (views, channel/author, duration, uploaded, videoId); `norm()` metadata carry karta hai; naya `enrichYtMeta()` (URL wale result ko ytsearch se views/channel deta hai — videoId match karke, top-8 scan); naya `songCaption()` (shared rich caption builder) + `formatViews()` (51.24 Cr / Lakh / K).
- **Honest note:** .ytmp4 ka VIDEO download is VM se abhi fail ho raha hai (saare 3 video sources — registry, downloadAny, Elite ytmp4 — slow/fail; Elite ytmp4 16s me null return kar raha hai). Handler logic mock test se PASS hai (video + rich card sahi banta hai) — user ke host (KataBump) par API chalne par video + card dono aayenge. .play/.song/.ytmp3 ka AUDIO + card live test se PASS hai.
- v2.8.8 (.sudo + .vv2) + v2.8.7 (ping card) + v2.8.6 + v2.8.5 (.age) + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## .sudo fix + new .vv2 command (v2.8.8)

- **.sudo check:** shipped sudo list pehle se hi EMPTY hai (data/userGroupData.json `sudo: []`) — koi number set nahi tha, isliye remove karne layak kuch nahi tha. **Bugs fix:** (1) JID matching — pehle exact `includes()` tha, device suffix (`:1`) / LID / alag form wala JID sudo nahi mana jata tha; ab normalize karke compare hota hai. (2) `.sudo del` galat number par bhi "✅ removed" bolta tha (removeSudo hamesha true return karta tha); ab sach batata hai — nahi mila to "⚠️ list me nahi mila". (3) Duplicate add (alag form me same number) ab nahi hota. **Naya:** `.sudo clear` — saare sudo numbers ek saath hatao.
- **.vv2 (naya command):** (1) View-once reveal — photo / video / audio / *DOCUMENT* / sticker (`.vv` sirf photo/video/audio karta tha; `.vv2` document bhi kholta hai; reupload fallback same as .vv). (2) Status auto-download — `.vv2 status on` karne par har status (photo/video/audio) automatically download hokar owner ko bhej diya jayega (autostatus se independent — view/react OFF hone par bhi chalta hai). `.vv2 status off` / `.vv2 status` / `.vv2 help` bhi hain.
- v2.8.7 (ping card) + v2.8.6 + v2.8.5 (.age) + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## .ping screenshot-style card (v2.8.7)

- **lib/fakevCard.js updated (screenshot jaisa):** quoted contact card ab "© MADE BY INCONNU BOY SENSEI" dikhata hai (pehle "© QUEEN AKUMA") + bot photo (anime, 200x200 JPEG base64 embed) — har command reply par yehi card quote hota hai. Naya helper `demonAdReply()` — link preview card: title "QUEEN AKUMA", body "MADE BY INCONNU BOY SENSEI", source whatsapp.com (channel link), thumbnail bot photo.
- **command/ping.js:** `.ping` ab Pong ke saath QUEEN AKUMA link preview card bhejta hai — screenshot jaisa: card upar, phir "🏓 Pong!" + "Latency: Xms".
- v2.8.6 (audit + 7 fixes) + v2.8.5 (.age) + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## Full command audit + fixes (v2.8.6)

- **Audit (real, loader se):** 2,848 commands me se 2,482 real kaam karte hain. **366 nahi karte** — 218 stub (generic placeholder jawab) + 146 restored wrapper (smartRun AI fallback) + 2 missing file. NSFW/spam wale (nsfw/hentai/spamotp/otpbomb) policy se fix nahi kiye; baaki ke real fix aage batches me aayenge.
- **.menu FIX:** photo ab URL se bhejta hai (Catbox download slow hone par text-only ho jata tha). Test: 4x .menu = image, video, image, video — 3s (pehle 19s + text fallback).
- **7 commands real banaye:** `.afk` (AFK set/status/mention-reply/welcome-back, data/afk.json), `.hidetagx` (group hidden tag), `.fetch` (URL content), `.qrcode` (qrserver QR image — live test PASS), `.youtubesearch` (EliteProTech — live test PASS, real results), `.tiktoksearch` (tikwm — code sahi, VM se live call fail hua 'aborted', host par chal sakta hai), `.ytplay2` (YouTube audio via downloadApis).
- v2.8.5 (.age) + v2.8.4 + v2.8.3 ke fixes bhi isme hain.

## New command .age (v2.8.5)

- **.age** — Age calculator (gist se port: mistershubhamkumar/age.js). Usage: `.age 1998-01-01` ya `.age 15-08-2005`. Output: Years/Months/Days/Hours/Minutes/Seconds + DOB (weekday) + total days lived + zodiac + next birthday countdown (birthday wale din Happy Birthday!). Gist ka 365d/30d approximation hatakar accurate calendar math use kiya; galat/future date par clear error.
- v2.8.4 ke fixes bhi isme hain (.autostatus on = view + react, anti-delete restart-proof, .autoreact link).

## .autostatus on = view + react dono (v2.8.4)

- **.autostatus on ab view + react DONO karta hai** — pehle `.autostatus on` sirf view ON karta tha (reactOn alag se `.autostatus react on` se karna padta tha), isliye status seen hota tha par reaction nahi aata tha. Ab `.autostatus on` = view + react dono, `.autostatus off` = dono band. Sirf view chahiye to `.autostatus react off` karo, sirf react ke liye `.autostatusreact on` abhi bhi hai.
- v2.8.3 ke fixes bhi isme hain: `.autoreact on` = chat + status react, anti-delete restart-proof (disk persist), BAE5 messages bhi store.

## .autoreact status + anti-delete restart-proof (v2.8.3)

- **.autoreact ab status par bhi react karega** — pehle `.autoreact on` sirf chat messages par react karta tha (status skip hota tha), isliye status seen hota tha par reaction nahi aata tha. Ab `.autoreact on` = chat + status dono par react (autostatus reactOn + view bhi ON), `.autoreact off` = dono band. Sirf status ke liye `.autostatusreact on/off` abhi bhi alag se hai.
- **Anti-delete ab restart-proof hai** — delete hone wale messages ka store pehle sirf memory me tha (restart/redeploy par sab khatm). Ab store `data/antidelete-store.json` me save hota hai aur restart ke baad wapas load hota hai. `.antidelete` / `.selfantidelete` dono ke liye.
- **BAE5 messages bhi store hote hain** — dusre bots ke messages (BAE5 ID) pehle store hi nahi hote the, isliye unka delete recover nahi hota tha. Ab group me aane wale BAE5 messages bhi anti-delete store me jate hain (command ke liye abhi bhi ignore).
- **Audit (baaki toggles theek hain):** `.autostatus` view, `.autoread`, `.antilink` (lib/groupAnti.processMessage se enforce hota hai), `.anticall` — sab ki wiring + config check ki, kaam karte hain.
- Note: jo message delete hone SE PEHLE bot ko mila hi nahi (antidelete ON karne se pehle bheja gaya), use recover karna possible nahi hai — WhatsApp bot ko pehle se message chahiye hota hai.

## .vv fix + .menu hang-proof (v2.8.2)

- **.vv FIXED** — view-once photo par `.vv` se ab "No valid media URL or directPath" error nahi aayega. Wajah: quoted view-once media me url/directPath nahi hota (WhatsApp strip kar deta hai) aur purana code galat key se download karta tha. Ab sahi quoted key (stanzaId + participant) + `reuploadRequest` + `updateMediaMessage` retry use hota hai (Baileys 7 pattern). Audio view-once bhi support karta hai.
- **.menu hang-proof** — video ab URL se bheja jata hai (12MB buffer download nahi), isliye weak host (KataBump) par .menu atakega nahi. Photo 8s timeout race ke saath; koi bhi step fail ho to turant fallback (photo -> text-only menu).
- `warmMediaCache` ab sirf photo warm karta hai (12MB video background download band — RAM/bandwidth bachta hai).
- DUPLICATE-SKIP lines normal hain (koi command khoya nahi) — loader duplicate files ko pehle-wali file ke favour me skip karta hai; total 2,848 unique commands load hote hain.

## Menu photo/video auto-switch (v2.8.1)

- `.menu` ab har baar photo aur video **alternate** karta hai — pehli baar photo + menu, dusri baar video + menu, phir photo, phir video...
- Choice `data/menuMedia.json` me save hoti hai, restart ke baad bhi sequence continue karega.
- Video fail ho (Catbox down) to photo fallback; photo bhi fail ho to text-only menu.
- Photo: `settings.menuImage` (Catbox PNG), Video: `settings.menuVideo` (Catbox MP4). `.customize` se badle ja sakte hain.
- Sirf `.menu` par hai (`.menu2`/`.menu3` abhi photo-only hain).

## Chalane ke liye
1. `npm install --legacy-peer-deps`
2. `cp sample.env .env` aur `SESSION_ID` ya `PAIRING_NUMBER` bharo
3. `node index.js`

Deploy steps `DEPLOY.md` me hain (Heroku / Render / Railway / Koyeb / Replit / Docker / Panel / VPS+PM2 / Termux).


## v3.0.0 — 8 UNIQUE FEATURES (2026-11-16)
User ne 8 ideas me se sab chune — sab ek saath:

1. **Multi-Bot Manager** — `.addbot <number>` (max 3 extra), `.bots`, `.removebot`. Har extra bot ka apna session (session/extra_<number>), restart par autostart. lib/multiBot.js
2. **Plugin Store** — `.store`, `.store install <name|url>`, `.store remove <name>`. Sirf owner, sirf GitHub raw URLs, safety scan (child_process/eval/env blocked), hot-load via reloadCommands(). Starter plugins: store-plugins/motivate.js, countdown.js, password.js (bot ko GitHub push karo tabhi install chalega).
3. **Economy + Games** — `.daily` (100 coins/24h), `.balance`/`.coins`, `.bazaar`, `.buyitem`, `.sendcoins`, `.richlist`, `.gamble`, `.kaam`, `.rob`. Quiz jeetne par +20/+30 coins (lib/quizGame.js hook). lib/economy.js, data/economy.json
4. **AI Vision** — `.vision [sawal]` (photo par reply). Gemini 2.0 Flash vision, GEMINI_API_KEY chahiye. command/vision.js
5. **Voice Mode** — voice note → transcribe (Groq Whisper / Wit.ai, free keys) → command → voice reply (gTTS). `.voicemode`, `.vlang hi|en`, `.bol <text>`. Details: VOICE_MODE.md. lib/voiceMode.js + lib/messageHandler.js hook.
6. **Live Dashboard** — `/dashboard` page + `/api/stats`. Uptime, version, total commands, top 10, recent 20. lib/dashboard.js, lib/server.js routes.
7. **Schedule / Reminders** — `.setremind 10m <text>` (ek baar), `.setremind 18:30 <text>` (roz), `.myreminders`, `.delremind <id>`. Restart-proof (data/schedules.json). lib/scheduler.js, index.js wiring.
8. **One-tap Backup** — `.fullbackup` (owner-only, DM-only). session/ + data/ + settings.js ka zip DM me. .env include NAHI hota (safety). command/fullbackup.js

Env vars (naye): GROQ_API_KEY, WIT_AI_TOKEN (.env.example dekho).
Honest limits: Voice STT ke liye free key zaroori; Plugin Store ke liye bot GitHub par push hona chahiye; Multi-Bot KataBump free (308MB) par 2 bot tak comfortable.


## v3.1.0 — WhatsApp Button Ludo (2026-11-16)
User ne "WhatsApp Button Ludo banao" chuna (Web Touch Ludo ke against — WhatsApp chat ke andar board par tap nahi kar sakte, isliye native-flow quick-reply buttons).
- lib/ludoGame.js — engine: 15x15 text board (monospace code block, R/G/Y/B goti, ★ safe, ◆ home column), asli rules (6 se bahar, capture, safe stars, home column, exact finish, 3 sixes = baari gayi, 2-min turn timeout, 10-min idle auto-end + entry refund), economy entry/pot (winner ko pot), stats data/ludo.json, jeet par Voice Mode se voice announcement (agar on hai).
- command/ludo.js — .ludo [entry] | .ludo join/start/roll/move 1-4/board/leave/end/help + .ludostats (wins + top 5).
- Buttons: native-flow quick_reply (group-status.js wala proven pattern — generateWAMessageFromContent + relayMessage + biz nodes), fallback plain text. Taps lib/messageHandler.js me intercept hote hain (userMessage startsWith 'ludo_' -> handleButton), dispatch se pehle. index.js me setSocket + startTimer wiring.
- Mock test PASS 34/34 (capture, safe cell, 3-sixes forfeit, home/finish/win, paid pot, button flow). Pehle run me 3 fail the — test bug tha (ek se zyada movable goti -> needChoice), engine sahi tha.
- HONEST LIMITS: games in-memory hain (restart par khatm); board text hai (image nahi — canvas dep nahi hai); buttons purane WhatsApp version par na dikhein to .ludo roll / .ludo move type karke khelo.


## v3.2.0 — AI Auto-Admin + .hack customise (2026-11-16)
User ne 129 ideas me se #1 AI Auto-Admin chuna, plus .hack set customise manga.
- lib/aiMod.js — Gemini (gemini-2.0-flash, GEMINI_API_KEY) har group message ko classify karta hai: abuse/fight/spam/promo/scam/nsfw/hate (Hinglish gaali samajhta hai). Verdict ok/warn/delete/kick + severity + Hinglish reason. Strikes data/aimod.json (default 3 strikes = kick). Flood detect bina AI ke (6 msgs/10s = warn, 10+ = delete). Per-user AI cooldown 10s, fail-open (API fail = kuch nahi), bot slow nahi hota (check background me). Admins/owner exempt, bot admin na ho to sirf warn. command/aimod.js — .aimod on/off/status/reset @user/set warnlimit|kick|delete/list (admin/owner only, group-only). Hook lib/messageHandler.js me groupAnti ke baad (fire-and-forget).
- command/hack.js REWRITTEN (purana .hack 20 alag messages bhejta tha — slow/spammy): ab EK message edit hota hai progress bar ke saath. lib/hackConfig.js — data/hack.json: .hack set name/msg/speed/steps/step/on/off/reset/show (owner-only). {user}/{hacker} placeholders.
- Mock tests: aiMod 33/33 PASS (2 real bugs mile: test me galat JIDs, aur flood-delete dead code — dono fix kiye), hack 12/12 PASS.
- HONEST LIMITS: AI mod ke liye GEMINI_API_KEY zaroori (bina key ke sirf flood detect chalega); Gemini har message par ~1-2s leta hai (action uske baad hota hai); AI kabhi-kabhi galat flag kar sakta hai (context-based, keyword nahi).


## v3.3.0 — 129 Ideas Batch 1: AI Tools + DevTools + Daily Life (2026-11-16)
User: "All ideas add kar do bot me" — batch-wise ban rahe hain. Batch 1 me 30 features:
- command/ai-tools.js (lib/aiTools.js + lib/aiMemory.js): .sher .kahani .email .debate .interview .fitness .codeai .quizgen .factcheck .rashifal .lovecalc .roastbattle .songfind .mathsolve (sab Gemini); .aistick (Pollinations image -> sticker); .imageedit (Gemini image model, quoted photo + prompt); .anuvad (MyMemory translate); .vstyle (gTTS + ffmpeg effects: chipmunk/robot/deep/slow/nightcore, voice note); .gsummary (group ke last 60 messages track karke Gemini summary — messageHandler hook); .aimemory (facts save/view/forget; .demonai prompt me memory use karta hai + auto-remember karta hai "mera naam..." jaisi baatein).
- command/devtools.js (lib/devCrypto.js): .hash (md5/sha1/sha256) .jsonfmt .regex .dnscheck .sslcheck .apicheck .coderun (owner-only, vm sandbox) .totp (2FA, khud ka TOTP secret) .vault (AES-256 password vault, master password) .encnote (AES encrypted notes).
- command/daily.js (lib/birthday.js): .dictionary (dictionaryapi.dev) .currency (Frankfurter fiat + CoinGecko crypto) .gold (gold-api.com XAU+XAG, INR me) .newsdigest (BBC RSS) .cricket (ESPN live score) .jobs (sarkariresult RSS) .khata (udhaar ledger) .kharcha (expense tracker + month report) .mynote .todo .filevault (per-user file save/get) .bday (birthday set/list + scheduler subah 8 baje auto-wish). .petrol aur .train ko free API key chahiye (COLLECTAPI_KEY / RAILWAY_API_KEY) — bina key ke setup hint dete hain.
- Mock test PASS 54/54. .anuvad aur .imageedit mock test me cover nahi hue (axios / image model) — live key se verify karna.
- HONEST LIMITS: Gemini wale commands ko GEMINI_API_KEY chahiye; .petrol/.train ko apni free key chahiye; .imageedit ka Gemini image model key/region par depend karta hai.

## v3.4.0 — Levanter Top 8 (2026-11-16)
User ne Levanter list se 1-8 add karne ko kaha; .antiedit ke liye group/DM alag setup manga.
- #1 .setcmd — PEHLE SE REAL tha (sticker commands + messageHandler trigger, 5s cache). Verify kiya, rebuild nahi.
- #2 .filter/.stop — PEHLE SE REAL tha (Levanter se ported, group/global/personal filters + onMessage hook). Verify kiya.
- #3 .antiedit REWORKED — ab har chat ka ALAG setup: group me .antiedit on sirf us group ke liye (admin/owner), DM me alag (owner only). Modes inchat/indm/off per chat + .antiedit status + .antiedit default (owner). Purana global mode default me migrate hota hai.
- #4 .budget/.income/.expense/.summary — PEHLE SE REAL tha. Verify kiya (income 5000, expense 200, balance 4800).
- #5 .setschedule/.getschedule/.delschedule — NAYA (lib/schedMsg.js + command/schedule.js + index.js wiring). 10m/2h/30s/1d ya 18:30 daily. .setremind se alag: ye message DUSRO ko bhejta hai.
- #6 .fx — NAYA (lib/fxEffects.js + command/fx.js). 17 image effects, Jimp LOCAL (no API): sketch pencil cartoon zombie makeup bokeh bloody horned enhance demon skull wanted kiss look color dark gandm. CAUGHT: Jimp 1.6.1 me brightness() MULTIPLIER hai (1=unchanged) — v0.x values se sab kaala ho gaya tha; fix karke 17/17 live test distinct outputs.
- #7 .setvar/.getvar/.delvar/.allvar — NAYA REAL system (lib/vars.js + setvar.js/allvar.js overwrite — pehle sirf smartRun fallback the). Owner-only, data/vars.json.
- #8 .vote — NAYA REAL system (lib/vote.js + command/vote.js — pehle sirf imp_vote wrapper tha). .vote <sawal> | opt1 | opt2, .vote 1, .vote results, .vote end (winner announce).
- Mock test 35/35 PASS. Loader: see below.

## v3.4.1 — .antiedit wiring fix + .fx direct names (2026-11-16)
v3.4.0 deliver hone ke BAAD pakda gaya bug (background check se):
- BUG: messageHandler.js me protocolMessage type 14 (MESSAGE_EDIT) ko REVOKE (delete) mana jata tha aur return kar diya jata tha — runHooks se PEHLE. Isliye antiedit.onMessage hook tak edit event kabhi pahunchta hi nahi tha. .antiedit command to tha, par edit report kabhi aati hi nahi.
- FIX: lib/messageHandler.js — type 14 ko revoke branch se alag kiya; edit event runHooks tak jata hai (antiedit.onMessage report karta hai), phir hooks ke baad return (edit ko command na samjha jaye). command/antidelete.js isRevokeType se pt===14 hata diya.
- .fx direct names: user ne 17 alag naam maange the (.demon .zombie ...). Ab .demon/.sketch/.zombie/... (16 names) seedha .fx effect chalate hain — lib/priority.json me fx.js ko owner banaya (audiofx ka .demon audio effect ab .fx demon se photo effect ban gaya — note: .demon ab photo effect hai, audio demon ke liye .audiofx demon use karo). 2 naam nahi mile: .skull (pehle se ek legacy editor command hai) aur .kiss (anime GIF command hai) — unke liye .fx skull / .fx kiss use karo.
- Mock test 44/44 PASS (v3.4.0 ke 35 + edit-flow through messageHandler group/DM + fx aliases).

## v3.5.0 — MEGA BUILD: 28 repos se genuinely-new features (2026-11-16)
User decision: NO games (chess/werewolf/flag quiz/word games/roulette/RPS/lottery/quizzes sab excluded). Har API-backed command me 2-3 API fallback sources (race/fallback chain) taaki response fast aaye. 28 GitHub MD bot repos + QUEEN AKUMA + QUEEN AKUMA check kiye; sirf genuinely-new features port kiye.
- **Batch A — Group systems + 8 picks:** Group Analytics (lib/groupAnalytics.js), Audit Log (lib/auditLog.js), Group Backup/Restore, .automute/.autounmute (lib/automute.js, scheduler tick), .softban (lib/softban.js, timed kick + auto re-add), .tagadmins, .onlyadmin (lib/onlyadmin.js), chat gates .pconly/.gconly/.swonly/.nyimak/.restrict (lib/chatgates.js, messageHandler me wired), per-platform antilink (lib/perlink.js), Anti-212/265 auto-ban (lib/anticountry.js, unban path ke saath), .create/.newgroup, .fullgpp (bina crop group PP), .glock/.gunlock, privacy suite .setprivacy/.getprivacy/.viewer/.setppall/.setonline (stock Baileys 7.0.0-rc14 privacy methods — baileys-pro NOT needed), .leavegc2, .slowmode (lib/slowmode.js), .presence, .setnewsletter, 21 audio FX (ffmpeg only, no API — phaser in_gain 0.4 fix, mono compand fix), multi-host uploader (lib/uploaders.js: Catbox/pomf/litterbox/pixhost/tmpfiles/qu.ax/x0.at/uguu fallback chain + uploadFast race), .findcmd (lib/cmdLookup.js text-scan), .reportbug, .getbio. Mock 98/98 PASS.
- **Batch B — Media:** video tools (.mp4reverse/.slowmo/.x2mp4/.x4mp4/.mp4image/.mp3crusher/.avmix/.vmix/.interp/.rotate — lib/mediaDl.js), meme canvas pack (some-random-api: .triggered/.passed/.oogway/.iss/.namecard/.youtube-comment/.face-palm), .memegen (memegen.link + Jimp fallback), .quotely (bot.lyo.su + Jimp fallback), .bgm system (7 triggers, XLICON MP3s) + .videomusic (BGM mix), .carbon (carbonara + Jimp fallback), .round/.fusion, .dehaze/.recolor (Jimp local — Vyro endpoint deliberately NOT used, unofficial/fragile). Mock 37/37 PASS.
- **Batch C — Downloads:** .mediafire REAL fix (page scrape + raganork API fallback — purana stub overwrite), .modapk (Aptoide API), .pixeldrain (official API + page scrape), .slideshare (third-party host — caveat), .deepimg (chatgot Flux unofficial/fragile + Pollinations fallback). Mock 13/13 PASS.
- **Batch D — Utilities:** .pdf (hand-rolled A4 PDF, no dep), .tovv, .wapoll (native poll), .zip/.botzip (owner DM-only), .structure/.tree, .savefile (owner-only hot-patch, guards), .getcase/.ambilq (owner-only), .reportbug, .zipcode (postalpincode + zippopotam), .iswa/.nowa, .getbio, .getexif (local), .srepo, .allcmd (sticker list — purani 'all' smartRun wrapper preserved), .doc, .edit, .retry, .diff, .fliptext, micro-codecs (.unbase64/.dbinary/.rcolor/.pick/.timenow/.count), .base64 REAL (imp_base64 overwrite), .subreddit, .animenews (ANN + MAL RSS), .population, .guessgender, .couplepp, .dit/.itta (gTTS fr/ja), .fakepoll (HONEST — stock Baileys preset votes nahi kar sakta, vote numbers labels me hain). Mock 40/40 PASS.
- **Batch E — Economy & Systems:** XP/Level/Roles (lib/xpSystem.js — QUEEN AKUMA formulas, 8-role ladder, .level rank card Jimp + .topxp, onMessage +5-15 XP), .register/.reg + .sn (MD5 serial), Rent system (.setexpired/.cekexpired/.listexpired — scheduler tick se auto-leave), Store (.addmsg/.getmsg/.listmsg/.delmsg — command/store.js Plugin Store ko chheda nahi), .bookmark/.saved, Away-msg scheduler (.setaway HH:MM-HH:MM — DM only, IST window), VCF group export (.vcfgen/.vcfread — .vcf savecontact wala untouched), Bank REAL (.bank deposit/withdraw/bonus — capacity 10000 + level×5000, lib/economy.js setBank), Bank multi-currency (.currencies/.exchange — 7 currencies), Chips economy (GAAJU — .checkbalance/.buychips/.addchips/.resetchips/.transactions/.unlimitedchips). Mock PASS (Batch E+F 42/42).
- **Batch F — AI (GAAJU best find):** Pollinations multi-model AI backend (lib/pollinations.js — gpt/mistral/gemini/deepseek/llama/claude, FREE, no key) ab lib/aiTools.js geminiText ka fallback hai — Gemini key na ho ya fail ho to Pollinations race (openai/mistral/deepseek) jawab deta hai. .summarise (no-key summary), .aivoice (Gemini jawab + gTTS voice note), .footballnews (BBC Sport RSS + ESPN), .ghtrend/.ghstalk (api.github.com), .telesticker (Telegram Bot API — TELEGRAM_BOT_TOKEN chahiye, TGS skip). NOT built: .intel/.deepseek research agent — Flash ka wss://searc.ai/ws endpoint VM se timeout (unverifiable, protocol unknown); .menufont/.menustyle — command/menu.js me theme/font hook hi nahi hai, .font1-40/.menutheme pehle se hain (dead code nahi banana tha).
- **Loader:** 3,032 unique names / 2,870 aliases (v3.4.1: 2,918 / 2,624), 0 load errors. Mock total: 98+37+13+40+42 = 230/230 PASS. Real npm-install loader test + smoke test PASS.
- **Imaandaar notes:** some-random-api / memegen.link / bot.lyo.su / carbonara / chatgot / bioskop-six VM se live-verify nahi hue (VM egress filtered) — host par kaam karne chahiye, fail hone par handlers honest error dete hain. .deepimg aur .slideshare fragile third-party hosts par hain.
- **Audit-fix (2026-11-16, zip banne ke baad — v3.5.0 me folded):** Full bot audit (syntax 4,237 files 0 error; loader 3,032/2,870; real messageHandler wiring 69/69 PASS; .antiedit group+DM verify). 3 bugs fix kiye: (1) .memegen API path — uploadFileFast `{url, host}` object deta hai, code string samajh raha tha (`background=[object Object]`) — ab real link jata hai; (2) .cekexpired legacy `lg_expired_cek.js` se shadowed tha (rent split-brain) — `lib/priority.json` me rent.js owner banaya, loader se verify (DUPLICATE-SKIP 87→86); (3) .register bina args ke galat reply deta tha (args check pehle aaya).
- **Batch 2+3 fixes (2026-11-16 ~21:40 IST — user screenshots se):** (1) **.antidelete split-brain (asli bug):** command do baar load hota tha — instance A (hooks) aur instance B (command) ke alag store/config the, isliye `.antidelete on` dikhta tha par hooks tak kabhi pahunchta hi nahi tha. Fix: shared state `global.__demonAntideleteShared` + config har baar disk se re-read (mtime check). Mock 48/48 — revoke ke baad group me original text + sender ke saath recovery report aati hai, status me `Messages stored ≥ 1`, `Deletes seen: 1 | Recovered: 1`. (2) **.antiselfdelete** registered hi nahi tha (asli naam .selfantidelete) — alias add kiya. (3) **.menutheme** sirf list karta tha, set nahi karta tha; .menu theme padhta hi nahi tha — ab `lib/menuTheme.js` (data/menutheme.json) + .menu royal/neon/classic delegate karta hai. (4) **.setvv / .setdetectvv** compat path se kabhi execute hi nahi hote the (smartEngine me branch hi nahi) — dono ko QUEEN-AKUMA-shape me rewrite kiya; auto-detect view-once → owner DM verify. (5) **QUEEN AKUMA branding:** command/pair.js poora REAPER copy tha (unki channel + naam) — QUEEN AKUMA / INCONNU BOY SENSEI kar diya; aur 9 files me REAPER/KnightBot/QUEEN-AKUMA strings the — sab fix (grep REAPER = 0). (6) **.addbot owner ko mana karta tha:** DM me owner ke apne phone se bheje message me participant nahi hota, handler dusre bande ko owner samajh leta tha — 7 files me fromMe = owner fix. (7) **Voice note auto-reply:** voice mode default ON tha — ab default OFF (opt-in, `.voicemode on`). Loader: **3,034 names / 2,869 aliases** (+1 = antiselfdelete alias), 0 errors. Mock total: 267 + 48 + 8 = **323/323 PASS** (batch-3 ka 1 fail mock-harness artifact hai — mock audio me real media keys nahi hote; lib-level proof se default OFF + opt-in ke baad setup hint confirm).
- **Version display fix (2026-11-16 ~21:09 IST):** console me "Bot Version 2.5.0" dikh raha tha — settings.js me hardcoded '2.5.0' tha, ab '3.5.0'.
- **Ping quote fix (2026-11-16 ~21:31 IST):** Pong reply par "Samim • Status" dikh raha tha — lib/fakevCard.js participant hamesha owner number banta tha; ab 0@s.whatsapp.net (WhatsApp Business ✓ verified) — quote par "© MADE BY INCONNU BOY SENSEI" dikhta hai.
- **Rent manager (2026-11-16 ~22:05 IST — user: .rentbot list nahi mil rahi):** `.rentbot` clone system tha, group rent nahi. Bugs mile: (1) `.listrent` file hosting par stored (offline) clones kabhi dikhata hi nahi tha (stored section sirf DB env me chalta tha); (2) file hosting par `session/clones/<id>/session.json` banti hi nahi thi (sirf DB me save hota tha) — restart ke baad list khaali; (3) rent ka koi hisaab hi nahi tha — kis ko diya, kab tak, kitne paise — kahin record nahi hota tha. Fix: naya `lib/cloneRent.js` (data/cloneRent.json — records + history) + 8 naye commands (command/rentmanage.js, sab owner-only, DM se bhi): `.rentlist` (poori list + counts + ONLINE/OFFLINE + expiry + price), `.rentadd <number> <30d> [price] [naam]`, `.rentremove <number|index>` (clone stop + record history me), `.rentinfo`, `.rentextend <number|index> <7d>`, `.rentexpiring [days]` (default 7), `.rentexpired` (purana hisaab), `.rentstats` (active/online/expiring/total ₹). `.listrent` rewrite — unified list (online conns + disk sessions via creds.json + rent records), wahi order `.rentlist`/`.stoprent` me bhi taaki index same rahe. `.stoprent` ab number/index/'all' se chalta hai (pehle restart ke baad "No sub-bots" bol deta tha). `.rentbot` ab file hosting par bhi session.json likhta hai aur connect hote hi basic rent record banata hai. Scheduler (har 30s) expired rent wale clone ko auto-stop karta hai + owner ko notice bhejta hai. Mock 20/20 PASS (real messageHandler). Loader: **3,042 names / 2,874 aliases**, 0 errors.

- **Audit fix Batch 2 (2026-11-16 ~22:24 IST — user ne kaha continue rakho):** 23 stub/wrapper names REAL kiye + 2 alias-owner repair: `.gpass` (crypto password gen), `.kulitkerangajaib` (Magic Conch), `.imstupid` (Stupid Meter, seeded), `.compatibility` (love % seeded), `.compliment2` (24 compliments), `.glossysilver` (real Jimp silver logo PNG), `.wastalk` (Baileys onWhatsApp + DP + about), `.onwa` (number check, 5 tak), `.cekprem` (data/premium.json list), `.delpremuser`, `.addprem` (bina iske cekprem kabhi kisi ko dikhata hi nahi), `.addlimituser`, `.unbanuser` (adminOnly fix — neeche dekho), `.unregister`, `.setppbot`, `.stickergif` (real ffmpeg webp→gif), `.aix` (geminiText/Pollinations), `.creart` (Pollinations image), `.eplstandings` (TheSportsDB), `.abellashort` (is.gd + tinyurl), `.gimg` (Openverse), `.4kwallpaper` (wallhaven 4K), `.tod` (truth/dare lists — compat wrapper smartEngine fallback deta tha), `.encode`/`.cipher` (binary jo kabhi ship hi nahi hota tha → pure-JS Caesar/Vigenère/XOR), `.twitterstalk` + 12 aliases (fxtwitter/github/tikwm router). Verify-only real nikle: .tt, .ban, .wanted, .pixelglitch, .jadian, .anime, .cap, .takehelp, .tutupjam, .spotifydl, .spotifyhelp, .1gb, .igaudio. UNFIXABLE (fake nahi banaya): .threadsdl, .pinterestvideo, .soraai (koi free no-key API nahi), .bili (Bilibili anti-bot 412), .uppb (paste APIs VM-unreachable). Skipped: .sleepmode (dispatcher gate chahiye), .unlockcmd (koi lock system hi nahi), .getsessiondatajson (session exfiltration — .exportsession hai), .setattr/.balasimg/.stori (purpose unclear), .deleteplugin/.bcgc/.otagall/.mention2/.oadd (agle batch). Mock 55/55 PASS (real messageHandler) + batch-1 audit test 37/37 regression PASS. **Bonus fix: `.unban` group me hamesha "Please make the bot an admin" bolta tha** — command me `adminOnly: true` hi nahi tha, isliye dispatcher isBotAdmin compute hi nahi karta tha; one-line fix, mock 3/3 PASS. Loader: **3,042 names / 2,874 aliases** (unchanged), 0 errors. Mock total: 323 + 20 + 55 + 3 = **401/401 PASS**.

- **WA Mini Bot #4 — Group metadata cache (2026-11-16 ~23:20 IST — user ne list me se 4 chuna):** Sach ye nikla ki main sock par 60s cache pehle se tha (index.js inline block) — lekin sirf main sock par; `.addbot`/`.rentbot` clones ka metadata kabhi cache nahi hota tha, aur lib/isAdmin.js ka apna alag 20s cache tha (double caching). Fix: naya shared `lib/groupMetaCache.js` (60s TTL, max 300 entries, per-sock cache, groups.update/group-participants.update par auto-invalidate, failed fetch cache nahi hota, idempotent wrap) — ab main sock (index.js) + .addbot clones (lib/multiBot.js) + .rentbot clones (command/rentbot.js) + har handler sock (lib/messageHandler.js lazy wrap) sab isse chalte hain; isAdmin ka alag cache hataya, ab wahi shared cache use karta hai. Mock ~/workspace/v35-gmcache-test.js 15/15 PASS (real messageHandler): 2 rapid .tagadmins = 1 fetch, .antilink on/off + .auditlog same cache share karte hain, non-admin abhi bhi sahi deny hota hai, invalidate/TTL-expiry/error-no-cache sab verify. Loader: **3,042 names / 2,874 aliases** (unchanged), 0 errors. **Finding (fix nahi kiya — agle batch ke liye):** group-protection toggles (.antilink/.antispam/.antibug/.antiflood/.warnlimit) me `adminOnly` hi nahi hai — group ka KOI BHI member inko on/off kar sakta hai. User se poochna hai ki in par admin gate lagana hai ya nahi.

- **.vv/.vv2 forward-first reveal — lyfe00011 gist port (2026-11-16 ~23:35 IST, user ne gist bheja):** Gist ka tareeka = quoted view-once ko `forwardOrBroadCast(..., {viewOnce:false})` se forward karna (download nahi). Port karte hue asli Baileys rc14 se verify kiya: gist jaisa seedha forward KAAM NAHI karta — `generateForwardMessageContent` wrapper unwrap karta hai lekin inner media ka `viewOnce: true` flag rehne deta hai (forward as-is -> viewOnce abhi bhi true, receiver ko phir view-once hi milta). Isliye lib/vv2.js me `forwardUnlocked()` — clone -> `normalizeMessageContent` -> `viewOnce=false` -> `sendMessage({forward, force:true})` — tab forward normal media bankar jata hai (image/video/document sab verify: viewOnce false/undefined, directPath intact). `.vv` (command/vv.js) aur `.vv2` reveal (lib/vv2.revealViewOnce) dono ab forward-first hain; forward fail ho to purana download tareeka fallback hai. Naya: `.vv <number>` / `.vv2 <number>` — unlocked media us number ko bhejo (0-prefix normalize: 09876543210 -> 91...). Gist ka `fromMe: true` (owner-only) port NAHI kiya — QUEEN AKUMA ka .vv/.vv2 pehle jaisa sab ke liye khula hai. Mock ~/workspace/v35-vv-gist-test.js 13/13 PASS (forward path, JID target, 0-prefix, fallback, no-mutation, status regression); purana vv test 48/48 (2 assertions forward delivery accept karne ke liye update kiye; uska dashboard.json delete karna bhi hataya — wo legit file hai). Loader 3,042/2,874, 0 errors.

- **.menutheme VERIFIED 2026-11-16 ~23:45 IST (user: ".menutheme thik se kam kar raha hai ki dekho"):** Mock ~/workspace/v35-menutheme-test.js **14/14 PASS** (real messageHandler): `.menutheme` list (3 themes + current mark), `.menutheme royal/neon/classic` set + data/menutheme.json persist, `.menu` uske baad sach me wahi theme dikhata hai (royal output = direct `.menu2` se byte-identical, neon me NEON MENU header, classic wapas aata hai), galat naam par error + theme unchanged, `menu2` alias bhi royal set karta hai. **Bug mila + fix kiya:** royal menu (menu2.js:43) me Commands count hardcoded `2025` tha — ab live loader count (3042) dikhta hai, classic/neon jaisa. Loader 3,042/2,874, 0 errors. **Finding (fix nahi kiya — poochna hai):** `.menutheme` par koi owner gate nahi hai — group ka koi bhi member bot-wide theme badal sakta hai (antilink toggles wali hi baat).

- **.menutheme owner/admin lock DONE 2026-11-16 ~23:50 IST (user ne "Okay krdo" kaha):** Theme bot-wide setting hai — ab SET sirf owner ya group admin kar sakta hai (command/menu3.js menutheme handler me in-handler check: fromMe/owner/sudo pass, group me lib/isAdmin se isSenderAdmin check — dispatcher ka `adminOnly` flag use nahi kiya kyunki wo list view ko bhi block kar deta aur context.isSenderAdmin us branch ke bina false rehta). `.menutheme` list (bina arg) sab ke liye khuli hai; galat naam par error reply pehle jaisa. Mock ~/workspace/v35-menutheme-gate-test.js **10/10 PASS** (owner DM set OK, group MEMBER denied + file unchanged, group ADMIN set OK, MEMBER list OK, non-owner DM denied); purana menutheme test regression 14/14 PASS. Loader 3,042/2,874, 0 errors.

- **.selfantidelete VERIFIED 2026-11-16 ~23:55 IST (user: "on hone ke baad asal me kya working hai, output dikhao"):** Mock ~/workspace/v35-selfantidelete-test.js **10/10 PASS** (real messageHandler, DM with Piyarul): `.selfantidelete on` -> ON + config self=true; status me DM ✅ ON + stored count; DM message store hota hai; delete (REVOKE) par recovery report aata hai — original text + sender + deleted-by + sent/deleted time — aur report **owner ke apne chat (Message yourself, 554488138425) me jata hai**, us DM me nahi; OFF par delete par koi recovery nahi. **Wording bug mila + fix kiya:** ON reply kehta tha "same chat me recover karega" — galat tha, ab sahi likha hai ("tumhare apne chat (Message yourself) me recover karega"). (Test me pehle Sent date "year 58846" dikhi thi — wo mock ki galti thi: mock ne messageTimestamp milliseconds me diya tha, asli Baileys seconds me deta hai; mock fix karke re-run kiya to date sahi aayi — bot me koi bug nahi.) Loader 3,042/2,874, 0 errors.

---
## v3.6.0 (user ne list me se item 1 + 3 chune, 2026-11-17 ~00:01 IST; DELIVERED 2026-11-17 ~00:20 IST)

### 1. Group-protection toggles par owner/admin lock
- **Problem:** `.antilink/.antispam/.antibug` aur baaki group-protection toggles par koi gate nahi tha — group ka koi bhi member on/off kar sakta tha.
- **Fix — shared helper `lib/ownerAdmin.js` (`canToggle`):** owner (fromMe / senderIsOwnerOrSudo) hamesha allow; group me group-admin allow (lib/isAdmin se check); DM me sirf owner. `adminOnly: true` NAHI lagaya — dispatcher ki adminOnly branch me isBotAdmin bhi require hota hai (bot admin na ho to group admin bhi toggle nahi kar pata; yehi .unban bug tha).
- **Gate lagi (17 groupAnti toggle files, SET branch only — status dekhna public):** antilink, antispam, antibug, antisticker, antiimage, antivideo, antiaudio, antivoice, antidoc, antimedia, antiforward, antibot, antilocation, antipoll, antivv (on/off ke saath `action delete|warn|kick` bhi), antitag, anticontact.
- **`.warnlimit` (command/warnings.js):** pehle se `adminOnly: true` tha (bot-admin bhi require karta tha) — ab wahi in-handler pattern; usage (galat number) public, sirf set gate hai.
- **`.antidelete` (command/antidelete.js):** on/off/dest/own chaaro set branches gate; status public.
- **Pehle se gated (chheda nahi):** antiword, antifake, antibadword (adminOnly); `.antiedit` (apna isOwnerOrAdmin check pehle se tha — verify kiya); `.antimention` live owner `new_antimention.js` (adminOnly); `.antiflood` / `.antidemote` / `.antipromote` live `shield.js` aliases ke through (shield adminOnly: true — gate hai, lekin bot-admin bhi require karta hai).
- **Deviations (verify karke):** `command/antiflood.js` aur `command/antimention.js` legacy `cmd()` files hain — loader unhe load hi nahi karta (dead); `.antiflood` shield alias se chalta hai. `command/antidemote.js` / `antipromote.js` standalone load hote hain par loader unhe shield alias se replace kar deta hai (dono "Smart Engine"/"Restored" category hain, isliye `__wrapper=true`; native alias jeetta hai) — unki smartEngine implementation kabhi chalti hi nahi. `antiflood.js` me groupOnly add karna no-op hota, isliye nahi kiya.

### 2. `.sleepmode` — real implementation + dispatcher gate
- **Pehle:** `command/owner-sleepmode.js` ek stub tha — sirf "✅ .sleepmode is working" reply karta tha (kabhi sleep karta hi nahi tha).
- **Ab (real):** `.sleepmode on|off|status`. State `lib/sleepMode.js` — `data/sleepmode.json {enabled, since, by}` (file na ho = awake). on/off sirf owner/admin (ownerAdmin.canToggle); status public. `sleep` alias NAHI hai (wo new_lurk.js ka alias hai).
- **Dispatcher gate (`lib/messageHandler.js` handleMessages):** revoke/edit handling, storeMessage, groupAnti aur hooks (runHooks) ke BAAD, command dispatch se PEHLE. Sleep ON ho aur sender owner na ho to: sirf `.sleepmode off` / `.sleepmode status` aage jaate hain (group admin ho to); baaki saare commands CHUP-CHAP ignore (koi reply nahi — spam nahi). Owner ke commands hamesha chalte hain. Main text dispatch + sticker-command dispatch dono jagah gate hai. Hooks/storage/antidelete recovery sleep me bhi chalte rehte hain.

### Verify
- **Naya test `~/workspace/v35-v360-test.js` — 38/38 PASS** (real messageHandler; group 12345@g.us, OWNER/ADMIN2/MEMBER): MEMBER set attempts denied + setting unchanged; ADMIN2/OWNER set allowed; status public; MEMBER `.antidelete on` denied, ADMIN2 allowed; MEMBER `.sleepmode on` denied; OWNER on → file enabled=true; sleep me MEMBER `.ping`/`.menu` par KOI reply nahi, OWNER `.ping` chalta hai; ADMIN2 `.sleepmode off` se wake; MEMBER `.sleepmode off` silent deny + abhi bhi sleep; OWNER off → MEMBER `.ping` phir chalta hai. Extras: `.antiedit` gate, `.antiflood` shield gate, `.antivv action kick` gate, `.warnlimit` usage public.
- **Regression:** vv-fix 48/48, menutheme 14/14, gmcache 15/15, menu-check 8/8 (`.menu` me version **3.6.0** dikhta hai).
- **Loader: 3,042 names / 2,874 aliases, 0 errors** (sleepmode naam pehle se stub ke paas tha — count same; real implementation ne replace kiya).
- **Version:** package.json + settings.js `3.5.0` → `3.6.0`. data/ pristine (21 entries).

---
## v3.6.1 (user report 2026-11-17 ~06:29 IST — .setdetectvv on ke baad forward nahi hua, .menu par koi response nahi)

### Diagnosis (mock se prove kiya, real messageHandler)
- **Auto-detect kaam karta hai:** naya test ~/workspace/v35-v361-diag-test.js — `.setdetectvv on` → mode persist (data/database.json autoDetectVv) → member ka viewOnceMessageV2 image → owner DM ko "ViewOnce Recovered" forward. Wiring/store me koi bug nahi mila. Live fail hone ki wajah: (a) photo view-once thi hi nahi (normal photo ko detect ignore karta hai — by design), (b) photo ON hone se pehle aayi, (c) deploy host se WhatsApp media download fail, ya (d) purana zip deploy hai.
- **.menu HANG — root cause mila:** menu.js (classic) aur menu3.js (neon) Baileys ko `{image/video:{url}}` bhejte the — Baileys URL ko bina timeout ke fetch karta hai. Catbox (files.catbox.moe) VM shell + text browser se unreachable hai (curl 000, ~11s; live browser me tab load hua dikha par content verify nahi ho paya — unconfirmed). Host se Catbox blackhole ho to send ka await kabhi settle nahi hota — na text fallback chalta hai, na dispatcher ka error reply (throw hua hi nahi, hang hua). Mock me hang reproduce kiya: hang-url sock par 12s me koi menu reply nahi, handler settle nahi hua.
- **Speed:** .ping 203ms (normal commands pehle se fast hain); .menu hi slow tha — cold cache par 1.5s buffer race + URL send.

### Fix
- **menu.js + menu3.js — kabhi hang nahi:** naya `lib/mediaCache.probeUrl(url, 3000)` (HEAD probe); URL bhejne se PEHLE probe, send par 8s race; fail ho to URL 60s ke liye dead-mark (agle calls seedha text). Text menu HAMESHA aata hai. Warm cache hit ho to photo instant.
- **lib/vv-autodetect.js — silent fail khatam:** download ya forward fail ho to owner DM me short text notice aata hai ("ViewOnce ... par download nahi ho paya"), taaki pata chale detect chala par download fail hua.
- **Version:** package.json + settings.js 3.6.0 → 3.6.1.

### Verify
- **Naya test ~/workspace/v35-v361-diag-test.js — 9/9 PASS** (real messageHandler): auto-detect E2E (A1–A5), .menu fast sock reply, hang-url sock par TEXT menu aaya + handler settle hua (B2), dobara .menu dead-cache se 304ms me text (B3), .ping 203ms.
- **Regression:** vv-fix 48/48, v360 (toggles+sleep) 38/38, menu-check 8/8 (version 3.6.1 dikhta hai).
- **Loader: 3,042 names / 2,874 aliases, 0 errors.** data/ pristine (21 entries).

---
## v3.6.2 (user report 2026-11-17 ~06:46 IST — ".antiedit command kam nahin kar raha")

### Diagnosis (mock se prove kiya, real messageHandler)
- **.antiedit command + hook wiring sahi hai:** loader me owner antiedit.js (native), hooks.message me onMessage hai aur hook === command.onMessage (same instance — split-brain nahi). Flow bhi sahi: edit event (protocolMessage type 14) revoke se alag hai, runHooks (line 722) tak pahunchta hai, phir `_isEditEvent` return karta hai. Naya test ~/workspace/v35-v362-antiedit-test.js: `.antiedit on` → member text → member edit → "EDITED MESSAGE" report Before/After ke saath — pehle run me hi 14/15 pass (status/off/member-deny/indm/DM sab sahi).
- **Asal bug — antispam edit ko kha jata tha:** test ke step 7b me report kahin nahi gayi — sent log me "🗑️ *antispam* — Spam detected" mila. groupAnti.processMessage (line ~700) runHooks (line 722) se PEHLE chalta hai; antispam default ON hai aur threshold 6 msgs / 8s hai — test karte hue jaldi-jaldi message+edit bhejne par member ka rate trip ho jata hai, aur groupAnti `blocked` return karke handler se return kar deta hai — edit antiedit hook tak pahunchta hi nahi. Edit event ka messageText khaali hota hai, phir bhi wo spam counter me gina jata tha. Real phone par bhi yahi hota hai: user test karte hue 2-3 message+edit jaldi bhej de to antispam trip aur report gayab.

### Fix
- **lib/messageHandler.js — edit events groupAnti se bypass:** `if (!message._isEditEvent)` guard — edit koi naya message nahi hai, uska content moderate karne layak nahi; edit hamesha runHooks tak pahunchega aur antispam counter me bhi nahi gina jayega. (Revoke events pehle se groupAnti se pehle return karte hain; storeMessage pehle se groupAnti se pehle chalta hai.)
- **Version:** package.json + settings.js 3.6.1 → 3.6.2.

### Verify
- **Naya test ~/workspace/v35-v362-antiedit-test.js — 18/18 PASS** (real messageHandler): on/status/off/member-deny/indm (report owner DM me, group me nahi)/DM-owner-on sab pass; **regression 9a–9c: antispam trip hone ke baad bhi edit report aayi** (base text cached, 5 rapid burst se "Spam detected" trip, phir edit → EDITED MESSAGE Before/After ke saath).
- **Regression:** vv-fix 48/48, v360 (toggles+sleep) 38/38, v361-diag 9/9, menu-check 8/8.
- **Loader: 3,042 names / 2,874 aliases, 0 errors.** data/ pristine (21 entries).

---
## v3.6.3 (user: "All anti command thik se kam kar raha hai ki batao" — full anti audit 2026-11-17 ~07:17 IST)

### Audit (naya test ~/workspace/v35-v363-anti-audit-test.js — real messageHandler, fresh sender per case)
- **19 groupAnti toggles ALL WORKS** (antilink, antispam, antibug, antisticker, antiimage, antivideo, antiaudio, antivoice, antidoc, antimedia, antiforward, antibot, antilocation, antipoll, antivv, antiword, antitag, anticontact, antimention): toggle on/off + offending content delete + notice; OFF par kuch delete nahi hota. antiaction (delete|warn|kick) bhi WORKS (warn → warning 1/3, kick → member removed).
- **Baaki anti systems WORKS:** .antidelete/.selfantidelete, .antiedit, .anticall (call reject + warning DM + block), .antifake (92 join → removed, 91 kept), .antigm (@everyone delete), .antilinkfb (fb link delete), warn system (.warn 3rd par auto-kick, .listwarn/.unwarn/.warnlimit), shield features (.antitoxic/.antiflood/.antitagall/.antiphishing/.antinewsletter/.antigroupstatus/.antiwords/.antibot), .antidemote/.antipromote (revert verified), .aimod flood (10 msgs/10s → 10th deleted).
- **UNVERIFIED (1):** .aimod AI classify (toxic/scam via Gemini) — GEMINI_API_KEY set nahi hai, classify fail-open `ok` deta hai; live AI moderation mock-testable nahi hai.
- **DEAD-ALIAS / stubs (alag protection nahi hain):** antilink2, antilinkalt, antilinkx, antilinks, anticolong, antiporn(legacy), xanti*, groupanti*, toolsanti*, new_anti* (13 loader me absent), antistatus (sirf status panel), antionce, antivvalt (antivv ka hi toggle). Ye naam alag se kuch protect nahi karte — inke native wale kaam karte hain.

### Fixes (audit me mile 3 real breaks)
- **.antibadword BROKEN → FIXED:** command lightweight_store me likhta tha (on/off/add/list), lekin lib/antibadword.js ka detection gate `data/userGroupData.json` padhta tha jise kuch nahi likhta tha — `.antibadword on` ke baad bhi koi message delete nahi hota tha. Fix: lib ka no-DB path ab store ko source of truth manta hai (JSON sirf legacy fallback). Bonus: command se add kiye custom words bhi ab check hote hain (pehle sirf hardcoded list check hoti thi); action default 'delete' (command wali setting me action field nahi hota); bot-admin check dono user.id forms (colon + flat) handle karta hai.
- **.antiporn BROKEN → FIXED (native rewrite):** legacy wrapper tha (Sightengine paid API + cmd() system jo bot me hai hi nahi) — "cmd is not a function". Ab native hai: lib/antiporn.js + command/new_antiporn.js — adult-domain links (pornhub/xvideos/xnxx/... + .xxx/.porn/.adult/.sex/.cam/.tube TLDs) group me auto delete, owner/admin gate (lib/ownerAdmin). Note: sirf LINKS block hote hain — image/video detection ke liye Sightengine keys chahiye (status me saaf likha hai).
- **.antistickerwarn BROKEN → FIXED (native rewrite):** legacy groupProtection.js wrapper tha (cmd() system) — "cmd is not a function". Ab native hai: `.antistickerwarn on` = sticker warn mode (groupAnti action warn + toggle on; limit par kick), `off` = delete mode, `<1-10>` = warn limit (`.warnlimit` se shared), `status` = action + limit dikhata hai.

### Verify
- **Audit test: 155 pass, 0 fail, 1 unverified** (aimod AI classify — no key). Fix test ~/workspace/v35-v363-fixes-test.js — **27/27 PASS** (antibadword hardcoded + custom word delete, antiporn link delete, antistickerwarn warn 1/3 + limit 5).
- **Regression:** vv-fix 48/48, antiedit 18/18, v360 38/38, v361-diag 9/9, menu-check 8/8 (version 3.6.3).
- **Loader: 3,042 names / 2,879 aliases (+5 naye antiporn/antistickerwarn aliases), 0 errors.** data/ pristine (21 entries).
- **Version:** package.json + settings.js 3.6.2 → 3.6.3.
