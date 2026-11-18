const express = require('express');
const { createServer } = require('http');
const packageInfo = require('../package.json');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// v2.9.0 — Custom pairing website (3rd connection method).
// Telegram /pair + KataBump console ke saath ab website se bhi pair karo:
//   https://<tumhara-host>/pair  -> number dalo -> 8-digit code lo
//   WhatsApp > Linked devices > Link with phone number > code dalo.
// Security: by default sirf owner ka number pair hota hai
// (PAIRING_NUMBER / owner). Kholna ho to env: ALLOW_ANY_PAIR=true
const pairing = require('./pairing');

app.use(express.json());

app.get('/pair', (req, res) => {
    // Pairing page (app/pair.html — QUEEN AKUMA branded).
    const fs = require('fs');
    const p = require('path').join(__dirname, '..', 'app', 'pair.html');
    if (fs.existsSync(p)) return res.sendFile(p);
    res.status(404).send('Pair page not found. Set PAIRING_NUMBER in .env and restart - the code prints in the terminal.');
});

// Website pairing API — pair.html isi ko call karta hai.
// GET /code?number=554488138425  -> { code: "1234-5678", number, status: "new_pairing" }
app.get('/code', async (req, res) => {
    const r = await pairing.requestPairCode(req.query.number || '');
    if (!r.ok) return res.status(400).json({ error: r.error, status: 'error' });
    res.json({ code: r.code, number: r.number, status: 'new_pairing' });
});

// POST /pair { number } — same, JSON body se
app.post('/pair', async (req, res) => {
    const r = await pairing.requestPairCode((req.body && req.body.number) || '');
    if (!r.ok) return res.status(400).json({ error: r.error, status: 'error' });
    res.json({ code: r.code, number: r.number, status: 'new_pairing' });
});

// GET /force-code?number=... — dobara code mango (force button)
app.get('/force-code', async (req, res) => {
    const r = await pairing.requestPairCode(req.query.number || '');
    if (!r.ok) return res.status(400).json({ error: r.error, status: 'error' });
    res.json({ code: r.code, number: r.number, status: 'new_pairing' });
});

// GET /status?number=... -> { registered, connected, isConnected } (page poll karta hai)
app.get('/status', (req, res) => {
    const st = pairing.getStatus();
    res.json({ ...st, isConnected: st.registered, number: pairing.cleanNumber(req.query.number || '') });
});

// GET /active -> pair.html ka poll endpoint
app.get('/active', (req, res) => {
    const st = pairing.getStatus();
    res.json({ active: true, ...st, count: st.registered ? 1 : 0, numbers: st.registered ? [st.owner] : [] });
});

// v3.0.0 Live Dashboard — /dashboard page + /api/stats JSON
app.get('/api/stats', (req, res) => {
  try { res.json(require('./dashboard').getStats()); }
  catch (e) { res.status(500).json({ error: String(e.message || e) }); }
});
app.get('/dashboard', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QUEEN AKUMA Dashboard</title><style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:20px}
h1{color:#ff3b5c;margin:0 0 4px}.sub{color:#8b949e;margin-bottom:20px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px}
.card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:14px}
.card b{font-size:26px;display:block;color:#58a6ff}.card span{color:#8b949e;font-size:13px}
table{width:100%;border-collapse:collapse;background:#161b22;border-radius:10px;overflow:hidden}
td,th{padding:10px 12px;border-bottom:1px solid #30363d;text-align:left;font-size:14px}
th{color:#8b949e}.links{margin-top:18px;color:#8b949e}.links a{color:#58a6ff}
</style></head><body>
<h1>😈 QUEEN AKUMA</h1><div class="sub">Live Dashboard — INCONNU BOY SENSEI</div>
<div class="cards">
<div class="card"><b id="version">—</b><span>Version</span></div>
<div class="card"><b id="uptime">—</b><span>Uptime</span></div>
<div class="card"><b id="total">—</b><span>Commands run</span></div>
</div>
<h3>🔥 Top Commands</h3><table><thead><tr><th>Command</th><th>Count</th></tr></thead><tbody id="top"></tbody></table>
<h3>🕒 Recent</h3><table><thead><tr><th>Command</th><th>When</th></tr></thead><tbody id="recent"></tbody></table>
<div class="links">Pair bot: <a href="/pair">/pair</a> &nbsp;•&nbsp; Status: <a href="/status">/status</a> &nbsp;•&nbsp; Auto-refresh 10s</div>
<script>
async function load(){try{const s=await (await fetch('/api/stats')).json();
document.getElementById('version').textContent='v'+s.version;
document.getElementById('uptime').textContent=s.uptime;
document.getElementById('total').textContent=s.totalCommands;
document.getElementById('top').innerHTML=s.topCommands.map(c=>'<tr><td>.'+c.name+'</td><td>'+c.count+'</td></tr>').join('')||'<tr><td colspan=2>No commands yet</td></tr>';
document.getElementById('recent').innerHTML=s.recent.map(r=>'<tr><td>.'+r.name+'</td><td>'+new Date(r.at).toLocaleTimeString()+'</td></tr>').join('')||'<tr><td colspan=2>—</td></tr>';
}catch(e){}} load(); setInterval(load,10000);
</script></body></html>`);
});

app.get('/', (req, res) => {
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${packageInfo.name.toUpperCase()} Status</title>
        <style>
            :root { --primary: #25d366; --bg: #0f172a; --card-bg: rgba(30, 41, 59, 0.7); }
            body { 
                margin: 0; padding: 0; background: var(--bg); color: white; 
                font-family: 'Inter', system-ui, sans-serif;
                display: flex; justify-content: center; align-items: center; min-height: 100vh;
            }
            .container {
                background: var(--card-bg); backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.1); padding: 30px;
                border-radius: 24px; width: 90%; max-width: 400px; text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .status-badge {
                display: inline-flex; align-items: center; background: rgba(37, 211, 102, 0.1);
                color: var(--primary); padding: 5px 15px; border-radius: 50px;
                font-size: 0.8rem; font-weight: bold; margin-bottom: 20px;
            }
            .dot { height: 8px; width: 8px; background: var(--primary); border-radius: 50%; margin-right: 8px; box-shadow: 0 0 10px var(--primary); }
            h1 { margin: 0; font-size: 1.8rem; letter-spacing: 1px; }
            .desc { color: #94a3b8; margin: 10px 0 25px 0; font-size: 0.9rem; }
            .grid { display: grid; gap: 12px; }
            .item { 
                background: rgba(0,0,0,0.2); padding: 12px 18px; border-radius: 12px;
                display: flex; justify-content: space-between; align-items: center;
            }
            .label { color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; }
            .val { font-weight: 600; font-family: monospace; color: #f1f5f9; }
            footer { margin-top: 25px; font-size: 0.7rem; color: #475569; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge"><span class="dot"></span> SYSTEM ONLINE</div>
            <h1>${packageInfo.name.toUpperCase()}</h1>
            <p class="desc">${packageInfo.description}</p>
            
            <div class="grid">
                <div class="item"><span class="label">Version</span><span class="val">${packageInfo.version}</span></div>
                <div class="item"><span class="label">Author</span><span class="val">${packageInfo.author}</span></div>
                <div class="item"><span class="label">Uptime</span><span class="val">${uptimeString}</span></div>
            </div>

            <footer>POWERED BY QUEEN AKUMA • INCONNU BOY SENSEI</footer>
        </div>
    </body>
    </html>
    `);
});

app.get('/process', (req, res) => {
    const { send } = req.query;
    if (!send) return res.status(400).json({ error: 'Missing send query' });
    res.json({ status: 'Received', data: send });
});

app.get('/chat', (req, res) => {
    const { message, to } = req.query;
    if (!message || !to) return res.status(400).json({ error: 'Missing message or to query' });
    res.json({ status: 200, info: 'Message received (integration not implemented)' });
});

module.exports = { app, server, PORT };

