# QUEEN AKUMA — Har Platform Par Deploy Karo 🚀

Ye bot **Node.js** par chalta hai. Neeche har platform ke steps hain.
Ek hi zip/repo sab jagah kaam karega — alag version banane ki zaroorat nahi.

## Kaunsa platform chalega? (sach)

| Platform | Chalega? | Note |
|---|---|---|
| KataBump | ✅ | Tum pehle se use kar rahe ho — sabse easy |
| Render | ✅ | Free plan, 15 min baad sleep (neeche keep-alive dekho) |
| Railway | ✅ | Free trial credit, phir pay-as-you-go |
| Heroku | ✅ | Free plan band ho gaya (2022 se) — paid dyno chahiye |
| Replit | ✅ | Free, lekin kabhi-kabhi slow/restart hota hai |
| Fly.io | ✅ | Free allowance me chhota app chal jata hai |
| Docker / VPS | ✅ | Koi bhi VPS (DigitalOcean, Hetzner, Oracle free tier) |
| Vercel | ❌ | **Nahi chalega** — Vercel serverless hai, WhatsApp socket ko hamesha ON rehna hota hai, Vercel function 10-60 second me band ho jata hai. Pairing page bhi Vercel par nahi chalegi kyunki usko live bot socket chahiye. |

## Pehle ye samjho — Session ka rule (sab platforms par)

Render/Railway/Heroku par **restart hote hi files delete ho jati hain** — isliye
session file (`session/creds.json`) wahan save nahi rehti. Iska fix:

1. **Pehli baar** bot ko KataBump ya apne PC par chalao, pairing code se connect karo.
2. WhatsApp par bot ko DM me `.exportsession` bhejo — bot session string dega
   (`QUEEN-AKUMA~...` se shuru hoti hai). (Note: purana `.getsession` naam
   `.pair` command ka alias hai — wo session nahi deta, isliye naya
   `.exportsession` command banaya gaya hai.)
3. Us string ko naye host par **`SESSION_ID` env var** me daal do.
4. Bas — ab restart par bhi bot turant connect hoga, dobara pair nahi karna padega.

> SESSION_ID khaali chhodo to bot pairing code mangega — website
> (`https://<host>/pair`) ya Telegram (`/pair`) se bhi pair kar sakte ho.
> Lekin env var wala tareeka sabse reliable hai.
>
> **Naya (v2.9.2): GitHub session backup** — SESSION_ID ke bajaye (ya uske
> saath) GitHub backup bhi chala sakte ho: PRIVATE repo + token set karo,
> bot khud session save/restore karega. Poora guide: `GITHUB_SESSION.md`.
> Commands: `.ghsave` / `.ghrestore` (owner only).

## Zaroori Env Vars (har platform par)

| Var | Kya daalo |
|---|---|
| `SESSION_ID` | `.getsession` se mili string (ya khaali = pairing code) |
| `PAIRING_NUMBER` | Tumhara WhatsApp number, country code ke saath — `554488138425` |
| `PORT` | Platform khud set karta hai — tumhe kuch nahi karna |
| `GEMINI_API_KEY` | Optional — AI commands ke liye |
| `TELEGRAM_BOT_TOKEN` | Optional — Telegram `/pair` ke liye (@BotFather se) |
| `TELEGRAM_OWNER_ID` | Optional — tumhara Telegram ID (@userinfobot se) |
| `ALLOW_ANY_PAIR` | `true` karo to website se koi bhi number pair ho (default: sirf owner) |

---

## 1. KataBump (tumhara current host)

1. Dashboard kholo: https://dashboard.katabump.com
2. Zip upload karo, deploy dabao.
3. Console me pairing code aayega — WhatsApp > Linked devices > Link with phone number.
4. Free plan **har 4 din renew** karna hota hai, 308 MB RAM.

## 2. Render (free)

1. GitHub par repo upload karo (ya zip se manual deploy).
2. https://dashboard.render.com → New → Web Service → repo choose karo.
3. Render `render.yaml` khud padh lega (Docker build, health check `/`).
4. Environment me `SESSION_ID` aur `PAIRING_NUMBER` daalo.
5. Deploy hone ke baad URL milega: `https://queen-akuma.onrender.com`
   - Pairing page: `https://queen-akuma.onrender.com/pair`
   - Status page: `https://queen-akuma.onrender.com/`
6. **Keep-alive (zaroori):** Free plan 15 min bina traffic ke baad sleep hota hai.
   https://uptimerobot.com par free account banao, apne Render URL ko
   har 5 min ping karne ke liye monitor lagao — bot jaagta rahega.

## 3. Railway

1. https://railway.app → New Project → Deploy from GitHub repo.
2. Railway `railway.json` se Dockerfile build karega, `node index.js` chalega.
3. Variables me `SESSION_ID` / `PAIRING_NUMBER` daalo.
4. Settings → Networking → Public domain generate karo.
5. Pairing page: `https://<tumhara-domain>/pair`

## 4. Heroku (paid)

1. GitHub repo se Heroku app banao, ya CLI: `heroku create queen-akuma`
2. `Procfile` pehle se hai (`web: npm start`), ffmpeg buildpack `app.json` me hai.
3. Config Vars me `SESSION_ID` / `PAIRING_NUMBER` daalo.
4. Deploy karo. Heroku button (README me bhi hai):
   `https://heroku.com/deploy?template=https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA`

## 5. Replit

1. https://replit.com → Import from GitHub.
2. `.replit` pehle se hai — Run dabate hi `npm install && npm start` chalega.
3. Secrets (lock icon) me `SESSION_ID` / `PAIRING_NUMBER` daalo.
4. Webview URL par `/pair` kholo.

## 6. Fly.io

1. `flyctl` install karo, `fly auth login` karo.
2. Bot folder me: `fly launch` (fly.toml pehle se hai) → `fly deploy`
3. Secrets set karo: `fly secrets set SESSION_ID="QUEEN-AKUMA~..." PAIRING_NUMBER="554488138425"`
4. URL milega: `https://queen-akuma.fly.dev` — `/pair` wahi khulega.

## 7. Docker (koi bhi VPS / server)

```bash
docker build -t queen-akuma .
docker run -d --name queen-akuma --restart unless-stopped \
  -p 5000:5000 \
  -e SESSION_ID="QUEEN-AKUMA~..." \
  -e PAIRING_NUMBER="554488138425" \
  queen-akuma
```

Pairing page: `http://<server-ip>:5000/pair`

## 8. Normal VPS (Ubuntu)

```bash
sudo apt update && sudo apt install -y nodejs npm git ffmpeg
git clone https://github.com/INCONNU-BOY-SENSEI/QUEEN-AKUMA.git queen-akuma
cd queen-akuma
npm install --legacy-peer-deps
cp .env.example .env   # SESSION_ID / PAIRING_NUMBER bharo
node index.js
# Hamesha ON rakhne ke liye: pm2 ya systemd use karo
npm i -g pm2 && pm2 start index.js --name queen-akuma && pm2 save
```

---

## Deploy ke baad check karo

1. `/` kholo — status page dikhna chahiye (version + uptime).
2. `/pair` kholo — pairing page dikhni chahiye (QUEEN AKUMA branding, +91).
3. WhatsApp par `.menu` bhejo — menu aana chahiye.
4. `.play tum hi ho` bhejo — thumbnail + audio aana chahiye.

Kuch na chale to console/logs me error dekho aur batao — session ID kabhi
kisi ko mat bhejo, sirf env var me daalo.

— INCONNU BOY SENSEI
