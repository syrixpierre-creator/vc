# AI Auto-Admin (v3.2.0)

## Setup
1. `.env` me `GEMINI_API_KEY` set karo (wahi key jo .demonai/.vision me chalti hai).
2. Group me bot ko **admin** banao (kick/delete ke liye).
3. Group me `.aimod on` likho (admin ya owner).

## Commands
- `.aimod on` / `.aimod off` — chalu/band
- `.aimod status` — status + top strikers
- `.aimod reset @user` — strikes clear karo
- `.aimod set warnlimit 3` — kitne strikes par kick (1-10)
- `.aimod set kick on|off` — limit par kick kare ya nahi
- `.aimod set delete on|off` — kharab message auto-delete kare ya nahi
- `.aimod list` — top strikers

## Kaise kaam karta hai
- Gemini har group message padhta hai: Hinglish gali, jhagda, spam, promo, scam, NSFW, hate.
- Verdict: ok / warn / delete / kick. 3 strikes = auto-kick.
- Flood: 6 messages/10s = warn, 10+ = delete (bina AI ke, instant).
- Bot slow nahi hota: check background me chalta hai.
- Group admin aur owner exempt hain.
- Bina GEMINI_API_KEY ke sirf flood detect chalega.

# .hack customise (v3.2.0)
- `.hack @user` — fake hack prank (ek message edit hota hai, progress bar ke saath).
- `.hack set show` — settings dekho
- `.hack set name X` — hacker name
- `.hack set msg X` — success message ({user} aur {hacker} likh sakte ho)
- `.hack set speed fast|normal|slow`
- `.hack set steps <3-10>` — kitne steps
- `.hack set step <n> <text>` — kisi ek step ka text badlo
- `.hack set on|off` / `.hack set reset`
- `.hack set` sirf owner kar sakta hai.
