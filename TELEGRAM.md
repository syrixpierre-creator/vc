# QUEEN AKUMA — Telegram (Full command bridge)

## Setup — token kahan dalna hai (2 tareeke, koi ek)

**Option A (easy, v2.8.10): settings.js me**
`settings.js` kholo, ye 2 lines bharo:
```js
telegramBotToken: '123456789:AAExxx...',   // @BotFather se (/newbot)
telegramOwnerId: '987654321',              // @userinfobot se
```

**Option B (safe): .env file me**
`.env.example` ko copy karke `.env` banao, phir ye lines bharo:
```env
TELEGRAM_BOT_TOKEN=<redacted>
TELEGRAM_OWNER_ID=987654321
```
(.env set ho to wahi chalega — settings.js wali values ignore hongi.)

> Note: `.env` naam se koi file zip me nahi hoti — `.env.example` ek
> template hai (dot se shuru hone wali files file manager me hidden
> hoti hain, isliye dikhai nahi deti). Isliye v2.8.10 se settings.js
> wala Option A bhi hai — wahi file sabko dikhti hai.
```bash
npm i node-telegram-bot-api
```

WhatsApp connect hone ke baad Telegram polling start hota hai.

## Features
Telegram messages same **commandHandler + plugins** se chalte hain:
- `.menu` `.menu2` `.help` `.ping` `.play` `.song` …
- Owner cmds: `TELEGRAM_OWNER_ID` match par
- Text / image / video / document / audio send support

## Limits (honest)
| Works well | Partial / limited |
|------------|-------------------|
| Text commands | WhatsApp group admin (kick/promote) |
| Downloads (link replies) | ViewOnce / antidelete |
| AI, OSINT, tools | WA status / gstatus |
| Menu / help / dexapi | Native WA buttons |

Group admin Telegram pe Telegram permissions se hota hai — WA-style kick plugin TG pe fail ho sakta hai.

## Commands
Same prefixes: `.` `!` `/` `#`
