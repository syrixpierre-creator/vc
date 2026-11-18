/**
 * QUEEN AKUMA v3.3.0 — Daily Life batch
 * .dictionary .currency .gold .petrol .newsdigest .cricket .train .jobs
 * .khata .kharcha .mynote .todo .filevault .bday
 */
const fs = require('fs');
const path = require('path');
const birthday = require('../lib/birthday');

function loadJson(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return def; } }
function saveJson(p, obj) { try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); } catch (_) {} }
function num(jid) { return String(jid || '').split('@')[0].replace(/:\d+$/, ''); }
function dataPath(name) { return path.join(__dirname, '..', 'data', name); }
async function fetchJson(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.3.0' } });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) { return null; } finally { clearTimeout(t); }
}
async function fetchText(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'QUEEN-AKUMA/3.3.0' } });
    if (!res.ok) return null;
    return await res.text();
  } catch (_) { return null; } finally { clearTimeout(t); }
}
function rssTitles(xml, n = 8) {
  if (!xml) return [];
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, n);
  return items.map((m) => {
    const title = (m[1].match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    return title.replace(/<[^>]+>/g, '').trim();
  }).filter(Boolean);
}
const CRYPTO = { btc: 'bitcoin', eth: 'ethereum', usdt: 'tether', bnb: 'binancecoin', sol: 'solana', xrp: 'ripple', doge: 'dogecoin', ada: 'cardano' };

module.exports = { commands: [
  {
    command: 'dictionary', aliases: ['dict'], category: 'tools',
    description: 'English word ka meaning, Hindi ke saath', usage: '.dictionary <word>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const word = (args[0] || '').trim();
      if (!word) return reply('❌ Usage: `.dictionary hello`');
      const data = await fetchJson('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
      if (!data || !data[0]) return reply(`❌ "${word}" ka meaning nahi mila. Spelling check karo.`);
      const e = data[0];
      const meanings = (e.meanings || []).slice(0, 3).map((m) => {
        const def = m.definitions && m.definitions[0];
        return `*${m.partOfSpeech}:* ${def ? def.definition : '—'}${def && def.example ? `\n  _Ex: ${def.example}_` : ''}`;
      }).join('\n\n');
      const phon = (e.phonetics || []).find((p) => p.text);
      return reply(`📖 *${e.word}*${phon ? ` (${phon.text})` : ''}\n\n${meanings}`);
    },
  },
  {
    command: 'currency', aliases: ['convert2'], category: 'tools',
    description: 'Currency aur crypto converter (live rates)', usage: '.currency <amount> <from> <to>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const amount = parseFloat(args[0]);
      const from = (args[1] || '').toLowerCase();
      const to = (args[2] || 'inr').toLowerCase();
      if (!amount || !from) return reply('❌ Usage: `.currency 100 usd inr` ya `.currency 1 btc usd`');
      if (CRYPTO[from] || CRYPTO[to]) {
        const id = CRYPTO[from] || CRYPTO[to];
        const vs = CRYPTO[from] ? to : from;
        const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`);
        if (!data || !data[id] || !data[id][vs]) return reply('❌ Crypto rate nahi mila. Dobara try karo.');
        const rate = data[id][vs];
        const out = CRYPTO[from] ? amount * rate : amount / rate;
        return reply(`🪙 *${amount} ${from.toUpperCase()} = ${out.toLocaleString('en-IN')} ${to.toUpperCase()}*\n\nRate: 1 ${from.toUpperCase()} = ${rate.toLocaleString('en-IN')} ${to.toUpperCase()} (CoinGecko, live)`);
      }
      const data = await fetchJson(`https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}&amount=${amount}`);
      if (!data || !data.rates || !data.rates[to.toUpperCase()]) return reply('❌ Currency rate nahi mila. Code check karo (USD, INR, EUR...).');
      const out = data.rates[to.toUpperCase()];
      return reply(`💱 *${amount} ${from.toUpperCase()} = ${out.toLocaleString('en-IN')} ${to.toUpperCase()}*\n\nRate: 1 ${from.toUpperCase()} = ${(out / amount).toFixed(4)} ${to.toUpperCase()} (Frankfurter, live)`);
    },
  },
  {
    command: 'gold', aliases: ['goldrate'], category: 'tools',
    description: 'Gold/Silver ka live rate', usage: '.gold',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const [xau, xag, fx] = await Promise.all([
        fetchJson('https://api.gold-api.com/price/XAU'),
        fetchJson('https://api.gold-api.com/price/XAG'),
        fetchJson('https://api.frankfurter.app/latest?from=USD&to=INR&amount=1'),
      ]);
      if (!xau || !xag) return reply('❌ Gold rate nahi mila. Dobara try karo.');
      const inr = fx && fx.rates ? fx.rates.INR : 88;
      const perGram = (usdPerOz) => (usdPerOz / 31.1035 * inr);
      return reply(`🥇 *Gold / Silver Rate (Live)*\n\n*Gold (XAU):* $${xau.price.toFixed(2)}/oz\n  • 10g (24K): ₹${Math.round(perGram(xau.price) * 10).toLocaleString('en-IN')}\n  • 1g (24K): ₹${Math.round(perGram(xau.price)).toLocaleString('en-IN')}\n\n*Silver (XAG):* $${xag.price.toFixed(2)}/oz\n  • 10g: ₹${Math.round(perGram(xag.price) * 10).toLocaleString('en-IN')}\n  • 1kg: ₹${Math.round(perGram(xag.price) * 1000).toLocaleString('en-IN')}\n\n_1 USD = ₹${inr.toFixed(2)} • Source: gold-api.com_`);
    },
  },
  {
    command: 'petrol', aliases: ['fuel'], category: 'tools',
    description: 'Petrol/Diesel price (city-wise)', usage: '.petrol <city>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const city = (args || []).join(' ').trim() || 'Delhi';
      const key = process.env.COLLECTAPI_KEY || '';
      if (!key) return reply(`⛽ *Petrol/Diesel Price*\n\nLive price ke liye free API key chahiye:\n1. https://collectapi.com se FREE key lo\n2. \`.env\` me daalo: \`COLLECTAPI_KEY=<redacted>\n\nPhir dobara try karo: \`.petrol ${city}\``);
      const data = await fetchJson(`https://api.collectapi.com/gasPrice/state?state=${encodeURIComponent(city)}`, 15000);
      if (!data || !data.result) return reply(`❌ "${city}" ka price nahi mila. City ka naam check karo.`);
      const r = data.result;
      return reply(`⛽ *Fuel Price — ${r.state || city}*\n\nPetrol: ₹${r.gasoline || '—'}/L\nDiesel: ₹${r.diesel || '—'}/L`);
    },
  },
  {
    command: 'newsdigest', aliases: ['news2'], category: 'tools',
    description: 'Subah ki khabrein — AI news summary', usage: '.newsdigest',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const xml = await fetchText('https://feeds.bbci.com/news/rss.xml');
      const titles = rssTitles(xml, 8);
      if (!titles.length) return reply('❌ News nahi mili. Dobara try karo.');
      return reply(`📰 *Aaj ki Khabrein (BBC)*\n\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`);
    },
  },
  {
    command: 'cricket', aliases: ['livescore'], category: 'tools',
    description: 'Live cricket score', usage: '.cricket',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const data = await fetchJson('https://site.api.espn.com/apis/site/v2/sports/cricket/scoreboard');
      const events = (data && data.events) || [];
      if (!events.length) return reply('🏏 Abhi koi live match nahi chal raha.');
      const lines = events.slice(0, 5).map((ev) => {
        const comp = ev.competitions && ev.competitions[0];
        const teams = (comp?.competitors || []).map((c) => `${c.team?.shortDisplayName || c.team?.displayName} ${c.score || ''}`).join(' vs ');
        const status = ev.status?.type?.detail || comp?.status?.type?.detail || '';
        return `• *${ev.name || teams}*\n  ${teams}\n  ${status}`;
      }).join('\n\n');
      return reply(`🏏 *Live Cricket Score*\n\n${lines}`);
    },
  },
  {
    command: 'train', aliases: ['trainstatus'], category: 'tools',
    description: 'Train running status / PNR (API key se)', usage: '.train <train number>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const trainNo = (args[0] || '').trim();
      if (!trainNo) return reply('❌ Usage: `.train 12002` (train number)');
      const key = process.env.RAILWAY_API_KEY || '';
      if (!key) return reply(`🚆 *Train Status*\n\nLive train status ke liye free API key chahiye:\n1. https://rapi.verifya2z.com se FREE key lo\n2. \`.env\` me daalo: \`RAILWAY_API_KEY=<redacted>\n\nPhir dobara try karo: \`.train ${trainNo}\``);
      const data = await fetchJson(`https://rapi.verifya2z.com/api/v1/train/status?train_no=${encodeURIComponent(trainNo)}&api_key=${encodeURIComponent(key)}`);
      if (!data) return reply('❌ Train status nahi mila. Number check karo ya dobara try karo.');
      return reply(`🚆 *Train ${trainNo}*\n\n\`\`\`\n${JSON.stringify(data, null, 2).slice(0, 1500)}\n\`\`\``);
    },
  },
  {
    command: 'jobs', aliases: ['govtjobs'], category: 'tools',
    description: 'Sarkari naukri ki latest khabrein', usage: '.jobs',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const xml = await fetchText('https://www.sarkariresult.com/feed/');
      const titles = rssTitles(xml, 8);
      if (!titles.length) return reply('❌ Jobs nahi mile. Dobara try karo.');
      return reply(`💼 *Sarkari Naukri — Latest*\n\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n_Source: sarkariresult.com_`);
    },
  },
  {
    command: 'khata', aliases: [], category: 'tools',
    description: 'Udhaar/hisaab rakho', usage: '.khata <name> <+/-amount> <reason> | .khata',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const db = loadJson(dataPath('khata.json'), {});
      if (!db[chatId]) db[chatId] = {};
      const book = db[chatId];
      if (!args.length) {
        const names = Object.keys(book);
        if (!names.length) return reply('📒 *Khata Book*\n\nKoi hisaab nahi hai.\nAdd karo: `.khata Rahul +500 chai` (+ = usne liya, - = usne diya)\nClear: `.khata clear Rahul`');
        const lines = names.map((n) => {
          const total = book[n].reduce((s, e) => s + e.amount, 0);
          return `• *${n}:* ${total >= 0 ? `₹${total} lena hai` : `₹${-total} dena hai`}`;
        }).join('\n');
        return reply(`📒 *Khata Book*\n\n${lines}`);
      }
      if (args[0].toLowerCase() === 'clear') {
        const name = args.slice(1).join(' ');
        if (!book[name]) return reply('❌ Ye naam khata me nahi hai.');
        delete book[name];
        saveJson(dataPath('khata.json'), db);
        return reply(`✅ *${name}* ka hisaab clear kar diya.`);
      }
      const name = args[0];
      const amount = parseFloat(args[1]);
      const reason = args.slice(2).join(' ') || '';
      if (!name || isNaN(amount)) return reply('❌ Usage: `.khata Rahul +500 chai` ya `.khata Rahul -200`');
      if (!book[name]) book[name] = [];
      book[name].push({ amount, reason, at: Date.now() });
      saveJson(dataPath('khata.json'), db);
      const total = book[name].reduce((s, e) => s + e.amount, 0);
      return reply(`📒 *${name}* — ${amount > 0 ? '+' : ''}₹${amount}${reason ? ` (${reason})` : ''}\n\nTotal: ${total >= 0 ? `₹${total} lena hai` : `₹${-total} dena hai`}`);
    },
  },
  {
    command: 'kharcha', aliases: ['expense'], category: 'tools',
    description: 'Kharcha likho, hisaab rakho', usage: '.kharcha <amount> <category> | .kharcha',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const db = loadJson(dataPath('expense.json'), { users: {} });
      const k = num(senderJid);
      if (!db.users[k]) db.users[k] = [];
      const list = db.users[k];
      if (!args.length || args[0].toLowerCase() === 'month') {
        const now = new Date();
        const monthList = list.filter((e) => { const d = new Date(e.at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
        const total = monthList.reduce((s, e) => s + e.amount, 0);
        const byCat = {};
        monthList.forEach((e) => { byCat[e.cat] = (byCat[e.cat] || 0) + e.amount; });
        const catLines = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => `• ${c}: ₹${v}`).join('\n') || 'Koi kharcha nahi.';
        return reply(`💰 *Kharcha — ${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}*\n\nTotal: *₹${total}*\n\n${catLines}\n\nAdd karo: \`.kharcha 200 khana\``);
      }
      const amount = parseFloat(args[0]);
      const cat = args.slice(1).join(' ') || 'general';
      if (!amount || amount <= 0) return reply('❌ Usage: `.kharcha 200 khana`');
      list.push({ amount, cat, at: Date.now() });
      saveJson(dataPath('expense.json'), db);
      const today = list.filter((e) => new Date(e.at).toDateString() === new Date().toDateString()).reduce((s, e) => s + e.amount, 0);
      return reply(`💰 Kharcha add: *₹${amount}* (${cat})\n\nAaj ka total: *₹${today}*`);
    },
  },
  {
    command: 'mynote', aliases: [], category: 'tools',
    description: 'Personal notes save karo', usage: '.mynote <text> | .mynote list | .mynote del <n>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const db = loadJson(dataPath('notes.json'), { users: {} });
      const k = num(senderJid);
      if (!db.users[k]) db.users[k] = [];
      const notes = db.users[k];
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'list') {
        return reply(notes.length ? `📝 *Tumhare Notes (${notes.length}):*\n\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}` : '📝 Koi note nahi hai. `.mynote <text>` se add karo.');
      }
      if (sub === 'del') {
        const n = parseInt(args[1], 10);
        if (!n || n < 1 || n > notes.length) return reply('❌ Usage: `.mynote del 1`');
        const gone = notes.splice(n - 1, 1);
        saveJson(dataPath('notes.json'), db);
        return reply(`✅ Note delete kar diya: "${gone[0].slice(0, 80)}"`);
      }
      const text = (args || []).join(' ').trim();
      if (!text) return reply('❌ Usage: `.mynote doodh lena hai`');
      notes.push(text.slice(0, 500));
      saveJson(dataPath('notes.json'), db);
      return reply(`✅ Note #${notes.length} save ho gaya.`);
    },
  },
  {
    command: 'todo', aliases: ['mytodo'], category: 'tools',
    description: 'Personal todos manage karo', usage: '.todo <text> | .todo list | .todo done <n>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const db = loadJson(dataPath('todos.json'), { users: {} });
      const k = num(senderJid);
      if (!db.users[k]) db.users[k] = [];
      const todos = db.users[k];
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'list' || !args.length) {
        if (!todos.length) return reply('✅ Koi todo nahi hai. `.todo <kaam>` se add karo.');
        return reply(`📋 *Tumhare Todos:*\n\n${todos.map((t, i) => `${t.done ? '✅' : '⬜'} ${i + 1}. ${t.text}`).join('\n')}\n\nDone karo: \`.todo done <n>\``);
      }
      if (sub === 'done') {
        const n = parseInt(args[1], 10);
        if (!n || n < 1 || n > todos.length) return reply('❌ Usage: `.todo done 1`');
        todos[n - 1].done = true;
        saveJson(dataPath('todos.json'), db);
        return reply(`✅ Done: "${todos[n - 1].text}"`);
      }
      if (sub === 'del') {
        const n = parseInt(args[1], 10);
        if (!n || n < 1 || n > todos.length) return reply('❌ Usage: `.todo del 1`');
        const gone = todos.splice(n - 1, 1);
        saveJson(dataPath('todos.json'), db);
        return reply(`✅ Delete kar diya: "${gone[0].text}"`);
      }
      const text = (args || []).join(' ').trim();
      todos.push({ text: text.slice(0, 300), done: false });
      saveJson(dataPath('todos.json'), db);
      return reply(`✅ Todo #${todos.length} add ho gaya: "${text.slice(0, 80)}"`);
    },
  },
  {
    command: 'filevault', aliases: ['fvault'], category: 'tools',
    description: 'Important files bot me save karo', usage: '.filevault <name> (file par reply karo) | .filevault list | .filevault get <name>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const k = num(senderJid);
      const dir = path.join(__dirname, '..', 'data', 'vault', k);
      const idxPath = path.join(dir, 'index.json');
      const idx = loadJson(idxPath, {});
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'list') {
        const names = Object.keys(idx);
        return reply(names.length ? `🗄️ *Tumhara File Vault (${names.length}):*\n\n${names.map((n, i) => `${i + 1}. ${n} (${idx[n].type}, ${Math.round(idx[n].size / 1024)}KB)`).join('\n')}\n\nWapas lo: \`.filevault get <name>\`` : '🗄️ Vault khaali hai. Kisi file par reply karke `.filevault <name>` likho.');
      }
      if (sub === 'get') {
        const name = args.slice(1).join(' ');
        const rec = idx[name];
        if (!rec) return reply('❌ Ye file vault me nahi hai.');
        const filePath = path.join(dir, rec.file);
        if (!fs.existsSync(filePath)) return reply('❌ File disk par nahi mili.');
        const buf = fs.readFileSync(filePath);
        if (rec.type === 'image') return sock.sendMessage(chatId, { image: buf, caption: `🗄️ ${name}` }, { quoted: message });
        if (rec.type === 'video') return sock.sendMessage(chatId, { video: buf, caption: `🗄️ ${name}` }, { quoted: message });
        if (rec.type === 'audio') return sock.sendMessage(chatId, { audio: buf, mimetype: 'audio/mpeg' }, { quoted: message });
        return sock.sendMessage(chatId, { document: buf, fileName: rec.file, mimetype: rec.mimetype || 'application/octet-stream', caption: `🗄️ ${name}` }, { quoted: message });
      }
      const name = (args || []).join(' ').trim();
      if (!name) return reply('❌ Usage: file par reply karke `.filevault <name>` likho.');
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) return reply('❌ Kisi file/photo/video par reply karke `.filevault <name>` likho.');
      try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const buf = await downloadMediaMessage({ key: { ...message.key, id: message.message.extendedTextMessage.contextInfo.stanzaId, remoteJid: chatId, participant: message.message.extendedTextMessage.contextInfo.participant }, message: quoted }, 'buffer', {}, { logger: { level: 'silent' } });
        fs.mkdirSync(dir, { recursive: true });
        const ext = quoted.documentMessage ? (quoted.documentMessage.fileName || '').split('.').pop() || 'bin' : quoted.imageMessage ? 'jpg' : quoted.videoMessage ? 'mp4' : quoted.audioMessage ? 'mp3' : 'bin';
        const file = name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) + '.' + ext;
        fs.writeFileSync(path.join(dir, file), Buffer.from(buf));
        const type = quoted.imageMessage ? 'image' : quoted.videoMessage ? 'video' : quoted.audioMessage ? 'audio' : 'document';
        idx[name] = { file, type, size: buf.length, mimetype: quoted.documentMessage?.mimetype || '', at: Date.now() };
        saveJson(idxPath, idx);
        return reply(`✅ File save ho gayi: *${name}* (${Math.round(buf.length / 1024)}KB)\nWapas lo: \`.filevault get ${name}\``);
      } catch (e) {
        return reply('❌ File save nahi hui: ' + String(e.message || e).slice(0, 120));
      }
    },
  },
  {
    command: 'bday', aliases: ['birthday2'], category: 'tools',
    description: 'Birthday yaad rakho, bot auto-wish karega', usage: '.bday set <DD-MM> <name> | .bday list | .bday del <name>',
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const senderJid = message.key.participant || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'list') {
        const list = birthday.list(chatId);
        return reply(list.length ? `🎂 *Birthdays:*\n\n${list.map((b) => `• ${b.name} — ${String(b.day).padStart(2, '0')}-${String(b.month).padStart(2, '0')}`).join('\n')}` : '🎂 Koi birthday save nahi hai. `.bday set 15-08 Inconnu` se add karo.');
      }
      if (sub === 'del') {
        const name = args.slice(1).join(' ');
        return reply(birthday.del(chatId, name) ? `✅ *${name}* ka birthday hata diya.` : '❌ Ye naam nahi mila.');
      }
      if (sub === 'set') {
        const m = (args[1] || '').match(/^(\d{1,2})-(\d{1,2})$/);
        const name = args.slice(2).join(' ').trim();
        if (!m || !name) return reply('❌ Usage: `.bday set 15-08 Inconnu` (DD-MM format)');
        const day = parseInt(m[1], 10), month = parseInt(m[2], 10);
        if (day < 1 || day > 31 || month < 1 || month > 12) return reply('❌ Galat date. Format: DD-MM (15-08)');
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        birthday.add(chatId, name, day, month, mentioned || senderJid);
        return reply(`🎂 *${name}* ka birthday save ho gaya: ${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}\n\nUs din subah 8 baje bot yahin wish karega! 🎉`);
      }
      return reply('🎂 *Birthday Wisher*\n\n`.bday set 15-08 Inconnu` — add karo\n`.bday list` — dekho\n`.bday del Inconnu` — hatao');
    },
  },
] };
