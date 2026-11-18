/**
 * QUEEN AKUMA • Real quiz game engine.
 * Problem it fixes: every tebak* game in QUEEN AKUMA was a stub — the starter
 * only replied "Game command ready" and the answer files only called the
 * AI fallback. No question was ever asked, no answer ever checked.
 * Now: real questions (embedded banks, tebakgambar from a public JSON),
 * per-chat state, 60s timeout, similarity check (0.72 like the originals),
 * .hint and .nyerah support. Wired into lib/messageHandler.js so a correct
 * answer is consumed before the chatbot/dexbot see it.
 */
const https = require('https');
const http = require('http');
const BANKS = require('./quizData');

const REMOTE_JSON = 'https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json';
const active = new Map(); // chatId -> game state
const PREFIXES = ['.', '!', '/', '#'];

const DEFS = {
  tebakgambar:    { title: 'TEBAK GAMBAR',  emoji: '🖼️', timeout: 60000, points: 40,  type: 'image' },
  tebakan:        { title: 'TEBAKAN',       emoji: '🧩', timeout: 60000, points: 40,  type: 'text' },
  tebaktebakan:   { title: 'TEBAK TEBAKAN', emoji: '😄', timeout: 120000, points: 4999, type: 'text' },
  tebaklirik:     { title: 'TEBAK LIRIK',   emoji: '🎵', timeout: 60000, points: 40,  type: 'text' },
  tebakmakanan:   { title: 'TEBAK MAKANAN', emoji: '🍔', timeout: 60000, points: 40,  type: 'text' },
  susunkata:      { title: 'SUSUN KATA',    emoji: '🔤', timeout: 60000, points: 40,  type: 'word' },
  caklontong:     { title: 'CAK LONTONG',   emoji: '🤔', timeout: 60000, points: 40,  type: 'riddle' },
  family100:      { title: 'FAMILY 100',    emoji: '👨‍👩‍👧', timeout: 90000, points: 100, type: 'family' },
  asahotak:       { title: 'ASAH OTAK',     emoji: '🧠', timeout: 60000, points: 50,  type: 'text' },
  lengkapikalimat:{ title: 'LENGKAPI KALIMAT', emoji: '✏️', timeout: 60000, points: 40, type: 'text' },
};

function fetchJson(url, timeout = 9000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout }, (res) => {
      if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode));
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function scramble(word) {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const out = letters.join('');
  return out === word ? scramble(word) : out;
}

function normalize(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[m][n];
}
function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const max = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / max;
}

async function buildQuestion(key) {
  const def = DEFS[key];
  if (key === 'tebakgambar') {
    const list = await fetchJson(REMOTE_JSON);
    const item = pick(list);
    return { text: item.deskripsi || item.soal || 'Tebak gambar ini!', img: item.img, answers: [item.jawaban] };
  }
  if (key === 'susunkata') {
    const word = pick(BANKS.susunkata);
    return { text: `Susun huruf ini menjadi kata yang benar:\n\n*${scramble(word).split('').join(' ')}*`, answers: [word] };
  }
  if (key === 'family100') {
    const item = pick(BANKS.family100);
    return { text: `${item.q}\n\nSebutkan ${item.a.length} jawaban yang benar, satu per satu!`, answers: item.a, multi: true };
  }
  const item = pick(BANKS[key]);
  const text = item.q || item.soal;
  return { text, answers: [item.a || item.jawaban], clue: item.clue };
}

async function start(sock, message, key) {
  const def = DEFS[key];
  const chatId = message.key.remoteJid;
  if (!def) return false;
  if (active.has(chatId)) {
    await sock.sendMessage(chatId, { text: `⏳ *${active.get(chatId).def.title}* masih jalan di chat ini!\nJawab dulu atau ketik *.nyerah* untuk menyerah.` }, { quoted: message });
    return true;
  }
  let q;
  try { q = await buildQuestion(key); }
  catch (e) {
    await sock.sendMessage(chatId, { text: `❌ Soal ${def.title} load nahi hua (${e.message || e}).\nInternet check karke dobara try karo, ya koi aur game khelo.` }, { quoted: message });
    return true;
  }
  const caption = `${def.emoji} *${def.title}*\n\n${q.text}\n\n⏱️ Waktu: ${def.timeout / 1000} detik\n🎁 Bonus: ${def.points} XP\n💡 Hint: ketik *.hint*  •  Menyerah: *.nyerah*`;
  let sent;
  try {
    if (q.img) sent = await sock.sendMessage(chatId, { image: { url: q.img }, caption }, { quoted: message });
    else sent = await sock.sendMessage(chatId, { text: caption }, { quoted: message });
  } catch (e) {
    await sock.sendMessage(chatId, { text: `❌ Soal bhej nahi paya: ${e.message || e}` }, { quoted: message });
    return true;
  }
  const timer = setTimeout(async () => {
    if (!active.has(chatId)) return;
    active.delete(chatId);
    const ans = q.answers.join(', ');
    try { await sock.sendMessage(chatId, { text: `⏰ *Waktu habis!*\n\n${def.emoji} ${def.title}\nJawaban: *${ans}*` }, { quoted: sent }); } catch {}
  }, def.timeout);
  active.set(chatId, { key, def, q, timer, found: new Set(), sent });
  return true;
}

function hintText(state) {
  const ans = state.q.answers[0];
  return String(ans).split(' ').map((w) => w[0] + '_'.repeat(Math.max(1, w.length - 1))).join(' ');
}

async function checkAnswer(sock, message, ctx = {}) {
  const chatId = ctx.chatId || message.key.remoteJid;
  const state = active.get(chatId);
  if (!state || message.key.fromMe) return false;
  const raw = (ctx.messageText || ctx.rawText || '').trim();
  if (!raw) return false;
  const isCmd = PREFIXES.some((p) => raw.startsWith(p));
  const bare = isCmd ? raw.slice(1).trim().toLowerCase() : raw.toLowerCase();
  // hint / give up — work with or without prefix
  if (['hint', 'hkan', 'bantuan', 'clue'].includes(bare)) {
    const hint = state.q.multi
      ? `Masih ${state.q.answers.length - state.found.size} jawaban lagi. Contoh: ${state.q.answers.find((a) => !state.found.has(normalize(a)))?.[0] || ''}...`
      : `💡 Hint: *${hintText(state)}*${state.q.clue ? `\nClue: ${state.q.clue}` : ''}`;
    await sock.sendMessage(chatId, { text: hint }, { quoted: message });
    return true;
  }
  if (['nyerah', 'surrender', 'giveup', 'skip', 'menyerah'].includes(bare)) {
    clearTimeout(state.timer);
    active.delete(chatId);
    await sock.sendMessage(chatId, { text: `🏳️ Menyerah!\n\n${state.def.emoji} ${state.def.title}\nJawaban: *${state.q.answers.join(', ')}*` }, { quoted: message });
    return true;
  }
  if (isCmd) return false; // real commands keep working during a game
  const guess = normalize(raw);
  if (!guess) return false;
  // family100: collect answers one by one
  if (state.q.multi) {
    const hit = state.q.answers.find((a) => !state.found.has(normalize(a)) && similarity(guess, a) >= 0.72);
    if (hit) {
      state.found.add(normalize(hit));
      const left = state.q.answers.length - state.found.size;
      if (left === 0) {
        clearTimeout(state.timer); active.delete(chatId);
        await sock.sendMessage(chatId, { text: `🎉 *SEMUA BENAR!* ${state.def.emoji} ${state.def.title} selesai!\n\nJawaban: ${state.q.answers.join(', ')}\n🎁 Bonus: *${state.def.points} XP*\n🪙 +30 coins` }, { quoted: message });
        try { require('./economy').addCoins(message.key.participant || message.key.remoteJid, 30); } catch (_) {}
      } else {
        await sock.sendMessage(chatId, { text: `✅ *Benar!* "${hit}"\nMasih ${left} jawaban lagi...` }, { quoted: message });
      }
      return true;
    }
    return true; // wrong guess while game active: swallow, don't trigger chatbot
  }
  const best = Math.max(...state.q.answers.map((a) => similarity(guess, a)));
  if (best >= 0.72) {
    clearTimeout(state.timer); active.delete(chatId);
    await sock.sendMessage(chatId, { text: `🎉 *BENAR!* ${state.def.emoji}\n\nJawaban: *${state.q.answers[0]}*\n🎁 Bonus: *${state.def.points} XP*\n🪙 +20 coins` }, { quoted: message });
    try { require('./economy').addCoins(message.key.participant || message.key.remoteJid, 20); } catch (_) {}
    return true;
  }
  return true; // wrong guess: swallow (game is active, text is a guess)
}

function listActive() {
  return [...active.entries()].map(([chat, s]) => ({ chat, game: s.key, title: s.def.title }));
}

module.exports = { start, checkAnswer, listActive, DEFS, similarity, normalize, active };
