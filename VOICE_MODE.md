# QUEEN AKUMA v3.0.0 — Voice Mode 🎙️

Bolo → bot sunega → command chalega → jawab voice me aayega.

## Setup (2 minute, free)

Voice sunne ke liye ek free STT key chahiye (bina key ke voice note kaam nahi karega — bot setup steps bhej dega):

**Option 1 — Groq (best, recommended)**
1. https://console.groq.com → Sign up (free, no card)
2. API Keys → Create API Key
3. `.env` me daalo: `GROQ_API_KEY=gsk_...`
4. Bot restart karo

**Option 2 — Wit.ai (fallback)**
1. https://wit.ai → app banao
2. Settings → Server Access Token copy karo
3. `.env` me daalo: `WIT_AI_TOKEN=...`

TTS (jawab bolna) ke liye koi key nahi chahiye — gTTS free hai.

## Commands

| Command | Kaam |
|---|---|
| `.voicemode` | Status dekho |
| `.voicemode on` / `off` | Voice Mode on/off (owner) |
| `.voicemode reply on` / `off` | Jawab voice me ya text me (owner) |
| `.vlang hi` / `en` | Sunne/bolne ki language (owner) |
| `.bol <text>` | Text ko voice note banao (sabke liye) |

## Kaise kaam karta hai

1. Voice note bhejo (2 minute tak ka).
2. Bot transcribe karta hai (Groq Whisper → Wit.ai fallback).
3. Agar text command hai (`.menu`, `.play ...`) → command chalta hai, aur pehla text reply **voice note** me bhi aata hai.
4. Agar text command nahi hai → bot transcription dikhata hai, phir AI (Queen Akuma AI / chatbot) text me jawab deta hai.

## Limits (honest)

- Voice note max 2 minute.
- STT ke liye Groq ya Wit.ai key zaroori hai (dono free).
- Voice reply sirf text replies ke liye — photo/video/sticker replies waise hi aate hain.
- Voice reply max ~600 characters (lamba reply chhota karke bolta hai).
- AI chat (non-command baat) ka jawab v3.0.0 me text me aata hai — voice reply uske liye agle update me.
