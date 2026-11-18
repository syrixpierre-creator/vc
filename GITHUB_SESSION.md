# QUEEN AKUMA — GitHub Session Backup 💾

QUEEN-AKUMA ka session save system — ab QUEEN AKUMA me (v2.9.2).

**Kya karta hai:** Tumhara WhatsApp session (`creds.json`) GitHub repo me
save hota hai. Render/Railway/Heroku restart par files delete kar dete hain —
GitHub backup se bot **khud session wapas la leta hai**, dobara pair nahi
karna padta.

## Setup (ek baar karo)

### 1. PRIVATE repo banao

GitHub par naya repo banao, naam jaise `QUEEN-AKUMA-SESSIONS`.

> ⚠️ **Repo HAMESHA PRIVATE rakho!** `creds.json` me tumhare WhatsApp
> account ka poora access hota hai. Public repo = account hijack.

### 2. Token banao

GitHub → Settings → Developer settings → Personal access tokens →
**Tokens (classic)** → Generate new token:

- Note: `QUEEN AKUMA session`
- Scope: **`repo`** ko tick karo (poora repo access)
- Expiry: No expiration (ya 90 din — expire ho to naya banana padega)

Token copy karo — wo dobara nahi dikhega!

### 3. Env vars set karo (host par)

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=ton-user/QUEEN-AKUMA-SESSIONS
GITHUB_BRANCH=main
```

- KataBump: dashboard me Environment Variables me daalo.
- Render/Railway/Heroku: dashboard ke Environment section me daalo.
- VPS: `.env` file me daalo.

> Token kabhi code file me mat likho, kabhi kisi ko mat bhejo.
> Mishu ki file me token hardcoded tha — QUEEN AKUMA me aisa nahi hai,
> token sirf env var se aata hai.

## Kaise kaam karta hai

| Kaam | Kab hota hai |
|---|---|
| **Auto-save** | Jab bhi session (creds) badle — 10 second baad, sirf tab jab kuch badla ho. Repo me `users/<tumhara-number>/creds.json` update hoti hai. |
| **Auto-restore** | Bot start hote waqt — na SESSION_ID ho na local session, to GitHub se download karke connect hota hai. |
| **Manual save** | WhatsApp par `.ghsave` bhejo (owner only). |
| **Manual restore** | WhatsApp par `.ghrestore` bhejo (owner only), phir bot restart karo. |

## Commands

- `.ghsave` — abhi session GitHub par save karo.
- `.ghrestore` — GitHub se session wapas lao (phir restart karo).

Dono sirf owner ke liye hain.

## SESSION_ID vs GitHub — kaunsa use karo?

- **SESSION_ID env** — sabse simple, ek string daalo, kaam khatam. Restart par bhi chalta hai.
- **GitHub backup** — jab SESSION_ID set karna bhool jao ya session update ho (creds kabhi-kabhi refresh hote hain) to GitHub backup kaam aata hai. Dono ek saath bhi chal sakte hain — SESSION_ID ki priority pehle hai, GitHub uske baad.

## Problem aaye to

- `.ghsave` par "set nahi hai" aaye → `GITHUB_TOKEN` aur `GITHUB_REPO` check karo.
- "404" error aaye → repo naam galat hai ya repo private nahi hai ya token ko access nahi hai.
- "Bad credentials" aaye → token galat hai ya expire ho gaya — naya banao.
- Restore ke baad bhi pairing mange → `.ghrestore` ke baad **restart** zaroori hai.

— INCONNU BOY SENSEI
