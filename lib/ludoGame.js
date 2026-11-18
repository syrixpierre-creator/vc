/**
 * QUEEN AKUMA v3.1.0 — WhatsApp Button Ludo (professional level)
 * 15x15 text board (monospace), native-flow quick-reply buttons (tap to play),
 * asli rules: 6 se bahar, capture, safe stars, home column, exact finish,
 * 3 sixes = chance gaya. Economy coins entry/pot, stats, turn timeout.
 */
const fs = require('fs');
const path = require('path');

const COLORS = ['red', 'green', 'yellow', 'blue'];
const EMOJI = { red: '🔴', green: '🟢', yellow: '🟡', blue: '🔵' };
const LETTER = { red: 'R', green: 'G', yellow: 'Y', blue: 'B' };
const START_OFFSET = { red: 0, green: 13, yellow: 26, blue: 39 };
const SAFE_ABS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const TURN_TIMEOUT_MS = 120000;
const IDLE_END_MS = 10 * 60 * 1000;
const MAX_PLAYERS = 4;

const TRACK_CELLS = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]
];
const HOME_COL = {
  red: [[7,1],[7,2],[7,3],[7,4],[7,5]],
  green: [[1,7],[2,7],[3,7],[4,7],[5,7]],
  yellow: [[7,13],[7,12],[7,11],[7,10],[7,9]],
  blue: [[13,7],[12,7],[11,7],[10,7],[9,7]],
};
const BASE_CELLS = {
  red: [[1,1],[1,4],[4,1],[4,4]],
  green: [[1,10],[1,13],[4,10],[4,13]],
  yellow: [[10,10],[10,13],[13,10],[13,13]],
  blue: [[10,1],[10,4],[13,1],[13,4]],
};
const BASE_AREA = { red: 'r', green: 'g', yellow: 'y', blue: 'b' };

const STATS_PATH = path.join(__dirname, '..', 'data', 'ludo.json');
const games = new Map(); // chatId -> game
let mainSock = null;
let timer = null;

function setSocket(s) { mainSock = s; }
function num(jid) { return String(jid || '').split('@')[0].replace(/:\d+$/, ''); }
function shortName(jid, pushName) {
  if (pushName) return String(pushName).slice(0, 12);
  const n = num(jid);
  return n.length > 10 ? '+' + n : n;
}
function absPos(color, rel) { return (START_OFFSET[color] + rel) % 52; }
function loadStats() {
  try { return JSON.parse(fs.readFileSync(STATS_PATH, 'utf8')); } catch (_) { return { users: {} }; }
}
function saveStats(st) {
  try { fs.mkdirSync(path.dirname(STATS_PATH), { recursive: true }); fs.writeFileSync(STATS_PATH, JSON.stringify(st, null, 2)); } catch (_) {}
}
function recordResult(game, winnerIdx) {
  const st = loadStats();
  game.players.forEach((p, i) => {
    const k = num(p.jid);
    if (!st.users[k]) st.users[k] = { wins: 0, games: 0, kills: 0 };
    st.users[k].games += 1;
    st.users[k].kills += p.kills || 0;
    if (i === winnerIdx) st.users[k].wins += 1;
  });
  saveStats(st);
}
function getStats(jid) {
  const st = loadStats();
  const me = st.users[num(jid)] || { wins: 0, games: 0, kills: 0 };
  const top = Object.entries(st.users).map(([j, u]) => ({ jid: j, ...u }))
    .sort((a, b) => b.wins - a.wins || b.kills - a.kills).slice(0, 5);
  return { me, top };
}

function getGame(chatId) { return games.get(chatId) || null; }

function createGame(chatId, creatorJid, creatorName, entry = 0) {
  if (games.has(chatId)) return { ok: false, error: 'Is chat me ek Ludo game pehle se chal raha hai. `.ludo board` se dekho.' };
  entry = Math.max(0, Math.floor(entry) || 0);
  const game = {
    chatId, phase: 'waiting', entry, pot: 0, creator: creatorJid,
    players: [{ jid: creatorJid, name: creatorName, color: 'red', tokens: [-1, -1, -1, -1], kills: 0 }],
    turn: 0, dice: null, sixCount: 0, pendingMove: null,
    createdAt: Date.now(), lastMoveAt: Date.now(), winner: null,
  };
  games.set(chatId, game);
  return { ok: true, game };
}
function joinGame(chatId, jid, name) {
  const game = games.get(chatId);
  if (!game) return { ok: false, error: 'Is chat me koi Ludo game nahi hai. `.ludo` se naya game banao.' };
  if (game.phase !== 'waiting') return { ok: false, error: 'Game shuru ho chuka hai, ab join nahi kar sakte.' };
  if (game.players.some((p) => num(p.jid) === num(jid))) return { ok: false, error: 'Tum pehle se game me ho!' };
  if (game.players.length >= MAX_PLAYERS) return { ok: false, error: 'Game full hai (4 players max).' };
  game.players.push({ jid, name, color: COLORS[game.players.length], tokens: [-1, -1, -1, -1], kills: 0 });
  game.lastMoveAt = Date.now();
  return { ok: true, game };
}
function startGame(chatId, starterJid) {
  const game = games.get(chatId);
  if (!game) return { ok: false, error: 'Pehle `.ludo` se game banao.' };
  if (game.phase !== 'waiting') return { ok: false, error: 'Game pehle se shuru hai.' };
  if (game.players.length < 2) return { ok: false, error: 'Kam se kam 2 players chahiye. Doston ko `.ludo join` karne bolo.' };
  if (game.entry > 0) {
    const eco = require('./economy');
    for (const p of game.players) {
      if (eco.balance(p.jid) < game.entry) return { ok: false, error: `@${num(p.jid)} ke paas ${game.entry} coins nahi hain (entry fee). Free game ke liye \`.ludo\` se naya banao.` };
    }
    for (const p of game.players) eco.addCoins(p.jid, -game.entry);
    game.pot = game.entry * game.players.length;
  }
  game.phase = 'playing';
  game.turn = 0;
  game.lastMoveAt = Date.now();
  return { ok: true, game };
}
function movableTokens(player, dice) {
  const out = [];
  player.tokens.forEach((pos, i) => {
    if (pos === -1 && dice === 6) out.push(i);
    else if (pos >= 0 && pos < 56 && pos + dice <= 56) out.push(i);
  });
  return out;
}
function currentPlayer(game) { return game.players[game.turn]; }

function doMove(game, playerIdx, tokenIdx, dice) {
  const p = game.players[playerIdx];
  const oldPos = p.tokens[tokenIdx];
  const newPos = oldPos === -1 ? 0 : oldPos + dice;
  p.tokens[tokenIdx] = newPos;
  let captured = null;
  let finished = false;
  if (newPos <= 50) {
    const abs = absPos(p.color, newPos);
    if (!SAFE_ABS.has(abs)) {
      game.players.forEach((op, oi) => {
        if (oi === playerIdx) return;
        op.tokens.forEach((opos, oti) => {
          if (opos >= 0 && opos <= 50 && absPos(op.color, opos) === abs) {
            op.tokens[oti] = -1;
            captured = { player: op, token: oti };
            p.kills = (p.kills || 0) + 1;
          }
        });
      });
    }
  }
  if (newPos === 56) finished = true;
  const won = p.tokens.every((t) => t === 56);
  return { captured, finished, won, newPos };
}
function nextTurn(game) {
  game.turn = (game.turn + 1) % game.players.length;
  game.dice = null;
  game.sixCount = 0;
  game.pendingMove = null;
  game.lastMoveAt = Date.now();
}

function rollDice(chatId, jid, forced) {
  const game = games.get(chatId);
  if (!game || game.phase !== 'playing') return { ok: false, error: 'Koi Ludo game nahi chal raha. `.ludo` se banao.' };
  const p = currentPlayer(game);
  if (num(p.jid) !== num(jid)) return { ok: false, error: `Abhi ${EMOJI[p.color]} ${p.name} ki baari hai, tumhari nahi!` };
  if (game.dice !== null || game.pendingMove) return { ok: false, error: 'Pehle goti chalao — dice ho chuka hai.' };
  const dice = forced || (1 + Math.floor(Math.random() * 6));
  game.dice = dice;
  game.lastMoveAt = Date.now();
  if (dice === 6) game.sixCount += 1;
  else game.sixCount = 0;
  if (game.sixCount >= 3) {
    const msg = `🎲 *3 baar 6!* ${EMOJI[p.color]} ${p.name} ki baari gayi.`;
    nextTurn(game);
    return { ok: true, game, dice, threeSix: true, msg };
  }
  const movable = movableTokens(p, dice);
  if (!movable.length) {
    const msg = `🎲 ${EMOJI[p.color]} ${p.name} ne *${dice}* nikala — koi goti nahi chal sakti.`;
    nextTurn(game);
    return { ok: true, game, dice, noMove: true, msg };
  }
  if (movable.length === 1) {
    return finishMove(chatId, game, movable[0]);
  }
  game.pendingMove = { playerIdx: game.turn, dice, movable };
  return { ok: true, game, dice, needChoice: true, movable };
}
function finishMove(chatId, game, tokenIdx) {
  const pIdx = game.turn;
  const p = game.players[pIdx];
  const dice = game.dice;
  const res = doMove(game, pIdx, tokenIdx, dice);
  game.pendingMove = null;
  game.lastMoveAt = Date.now();
  let msg = `🎲 ${EMOJI[p.color]} ${p.name} ne *${dice}* nikala, goti ${tokenIdx + 1} chali.`;
  if (res.captured) msg += `\n💥 *KAAT DIYA!* ${EMOJI[res.captured.player.color]} ${res.captured.player.name} ki goti wapas ghar!`;
  if (res.finished) msg += `\n🏠 Goti ${tokenIdx + 1} ghar pahunch gayi!`;
  if (res.won) {
    game.phase = 'done';
    game.winner = pIdx;
    recordResult(game, pIdx);
    if (game.pot > 0) {
      try { require('./economy').addCoins(p.jid, game.pot); } catch (_) {}
    }
    msg += `\n\n🏆 *${EMOJI[p.color]} ${p.name} JEET GAYA!* 👑${game.pot > 0 ? `\n💰 Pot: *${game.pot} coins* — winner ko mile!` : ''}`;
    const g = game;
    setTimeout(() => { if (games.get(chatId) === g) games.delete(chatId); }, 60000);
    return { ok: true, game, dice, won: true, msg, winner: p };
  }
  const extraTurn = dice === 6 || res.captured || res.finished;
  if (extraTurn) {
    game.dice = null;
    msg += '\n🎲 Ek aur chance — dobara roll karo!';
  } else {
    nextTurn(game);
  }
  return { ok: true, game, dice, msg };
}
function moveToken(chatId, jid, tokenIdx) {
  const game = games.get(chatId);
  if (!game || game.phase !== 'playing') return { ok: false, error: 'Koi Ludo game nahi chal raha.' };
  if (!game.pendingMove) return { ok: false, error: 'Pehle dice roll karo (`.ludo roll`).' };
  const p = currentPlayer(game);
  if (num(p.jid) !== num(jid)) return { ok: false, error: `Abhi ${EMOJI[p.color]} ${p.name} ki baari hai!` };
  if (!game.pendingMove.movable.includes(tokenIdx)) return { ok: false, error: 'Ye goti nahi chal sakti. Dusri chuno.' };
  return finishMove(chatId, game, tokenIdx);
}
function leaveGame(chatId, jid) {
  const game = games.get(chatId);
  if (!game) return { ok: false, error: 'Koi game nahi hai.' };
  if (game.phase !== 'waiting') return { ok: false, error: 'Game shuru ho chuka hai, ab leave nahi kar sakte. Creator `.ludo end` kar sakta hai.' };
  const i = game.players.findIndex((p) => num(p.jid) === num(jid));
  if (i < 0) return { ok: false, error: 'Tum game me ho hi nahi.' };
  game.players.splice(i, 1);
  if (!game.players.length) { games.delete(chatId); return { ok: true, game, empty: true }; }
  return { ok: true, game };
}
function endGame(chatId, jid) {
  const game = games.get(chatId);
  if (!game) return { ok: false, error: 'Koi game nahi hai.' };
  if (num(game.creator) !== num(jid)) return { ok: false, error: 'Sirf game creator end kar sakta hai.' };
  if (game.phase === 'playing' && game.pot > 0) {
    try {
      const eco = require('./economy');
      game.players.forEach((p) => eco.addCoins(p.jid, game.entry));
    } catch (_) {}
  }
  games.delete(chatId);
  return { ok: true, refunded: game.pot > 0 };
}

/** 15x15 text board — monospace code block me dikhta hai. */
function renderBoard(game) {
  const grid = Array.from({ length: 15 }, () => Array(15).fill(' '));
  const paint = (r0, c0, r1, c1, ch) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) grid[r][c] = ch; };
  paint(0, 0, 5, 5, BASE_AREA.red);
  paint(0, 9, 5, 14, BASE_AREA.green);
  paint(9, 9, 14, 14, BASE_AREA.yellow);
  paint(9, 0, 14, 5, BASE_AREA.blue);
  for (let i = 0; i < 52; i++) {
    const [r, c] = TRACK_CELLS[i];
    grid[r][c] = SAFE_ABS.has(i) ? '★' : '·';
  }
  for (const color of COLORS) for (const [r, c] of HOME_COL[color]) grid[r][c] = '◆';
  for (let r = 6; r <= 8; r++) for (let c = 6; c <= 8; c++) grid[r][c] = '✦';
  // tokens: cell -> [letters]
  const cellTokens = new Map();
  const put = (r, c, letter) => {
    const k = r + ',' + c;
    if (!cellTokens.has(k)) cellTokens.set(k, []);
    cellTokens.get(k).push(letter);
  };
  game.players.forEach((p) => {
    p.tokens.forEach((pos, ti) => {
      if (pos === -1) { const [r, c] = BASE_CELLS[p.color][ti]; put(r, c, LETTER[p.color]); }
      else if (pos >= 0 && pos <= 50) { const [r, c] = TRACK_CELLS[absPos(p.color, pos)]; put(r, c, LETTER[p.color]); }
      else if (pos >= 51 && pos <= 55) { const [r, c] = HOME_COL[p.color][pos - 51]; put(r, c, LETTER[p.color]); }
      else if (pos === 56) { put(7, 7, LETTER[p.color]); }
    });
  });
  for (const [k, letters] of cellTokens) {
    const [r, c] = k.split(',').map(Number);
    grid[r][c] = letters.length === 1 ? letters[0] : String(Math.min(letters.length, 9));
  }
  return grid.map((row) => row.join('')).join('\n');
}
function playerLine(p) {
  const toks = p.tokens.map((t) => (t === -1 ? '🏠' : t === 56 ? '✅' : String(t))).join(' ');
  return `${EMOJI[p.color]} *${p.name}* — goti: ${toks}  (kills: ${p.kills || 0})`;
}
function statusText(game) {
  const lines = game.players.map(playerLine).join('\n');
  let turn = '';
  if (game.phase === 'waiting') turn = `\n\n⏳ *Waiting...* (${game.players.length}/4 players)\nJoin karo: \`.ludo join\` ya neeche Join button dabao.\nStart: \`.ludo start\`${game.entry ? `\n💰 Entry: *${game.entry} coins* | Pot: ${game.entry * game.players.length}` : ''}`;
  else if (game.phase === 'playing') {
    const p = currentPlayer(game);
    turn = `\n\n🎲 *Baari:* ${EMOJI[p.color]} ${p.name}${game.pendingMove ? ' — goti chuno!' : game.dice !== null ? '' : ' — roll karo!'}`;
  } else if (game.phase === 'done' && game.winner !== null) {
    const w = game.players[game.winner];
    turn = `\n\n🏆 *Winner: ${EMOJI[w.color]} ${w.name}!*`;
  }
  return `🎲 *QUEEN AKUMA Ludo*${game.entry ? `  💰 Entry ${game.entry} | Pot ${game.pot}` : ''}\n\`\`\`\n${renderBoard(game)}\n\`\`\`\n${lines}${turn}`;
}
function buttonsFor(game) {
  if (game.phase === 'waiting') {
    return [
      { id: 'ludo_join', text: '🙋 Join Game' },
      { id: 'ludo_start', text: '▶️ Start Game' },
      { id: 'ludo_board', text: '🎲 Board' },
    ];
  }
  if (game.phase === 'playing') {
    if (game.pendingMove) {
      return game.pendingMove.movable.map((ti) => ({ id: `ludo_move_${ti}`, text: `${EMOJI[currentPlayer(game).color]} Goti ${ti + 1}` }));
    }
    if (game.dice === null) return [{ id: 'ludo_roll', text: '🎲 Roll Dice' }];
    return [{ id: 'ludo_board', text: '🎲 Board' }];
  }
  return [{ id: 'ludo_board', text: '🎲 Board' }];
}

async function sendButtons(sock, chatId, text, buttons, quoted) {
  try {
    const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
    const userJid = sock.authState?.creds?.me?.id || sock.user?.id;
    const interactiveContent = {
      body: { text },
      footer: { text: '😈 QUEEN AKUMA • Ludo' },
      nativeFlowMessage: {
        buttons: buttons.map((b) => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: b.text, id: b.id }) })),
      },
    };
    const fullMsg = generateWAMessageFromContent(chatId, { interactiveMessage: interactiveContent }, { userJid, ...(quoted ? { quoted } : {}) });
    const additionalNodes = [{ tag: 'biz', attrs: {}, content: [{ tag: 'interactive', attrs: { v: '1', type: 'native_flow' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }] }];
    await sock.relayMessage(chatId, fullMsg.message, { messageId: fullMsg.key.id, additionalNodes });
    return true;
  } catch (e) {
    try { await sock.sendMessage(chatId, { text: text + '\n\n_(Buttons nahi chale — type karke khelo: .ludo roll)_' }, { quoted }); } catch (_) {}
    return false;
  }
}
async function sendBoard(sock, chatId, game, extraText = '', quoted) {
  const text = statusText(game) + (extraText ? `\n\n${extraText}` : '');
  const btns = buttonsFor(game);
  if (btns.length) {
    const ok = await sendButtons(sock, chatId, text, btns, quoted);
    if (ok) return;
  }
  await sock.sendMessage(chatId, { text }, { quoted }).catch(() => {});
}

/** Button tap (ludo_*) ya .ludo subcommand se aaya action. Returns true = handled. */
async function handleButton(sock, message, ctx = {}) {
  const chatId = ctx.chatId || message.key.remoteJid;
  const senderJid = message.key.participant || message.key.remoteJid;
  const name = shortName(senderJid, message.pushName);
  const raw = (ctx.buttonId || '').trim();
  if (!raw.startsWith('ludo_')) return false;
  const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message }).catch(() => {});
  if (raw === 'ludo_join') {
    const r = joinGame(chatId, senderJid, name);
    if (!r.ok) return reply('❌ ' + r.error);
    await sendBoard(sock, chatId, r.game, `🙋 *${name}* join ho gaya! (${r.game.players.length}/4)`, message);
    return true;
  }
  if (raw === 'ludo_start') {
    const r = startGame(chatId, senderJid);
    if (!r.ok) return reply('❌ ' + r.error);
    await sendBoard(sock, chatId, r.game, `▶️ *Game shuru!* ${EMOJI[r.game.players[0].color]} ${r.game.players[0].name} pehle roll karega.`, message);
    return true;
  }
  if (raw === 'ludo_roll') {
    const r = rollDice(chatId, senderJid);
    if (!r.ok) return reply('❌ ' + r.error);
    await sendBoard(sock, chatId, r.game, r.msg || '', message);
    return true;
  }
  if (raw.startsWith('ludo_move_')) {
    const ti = parseInt(raw.slice(10), 10);
    const r = moveToken(chatId, senderJid, ti);
    if (!r.ok) return reply('❌ ' + r.error);
    await sendBoard(sock, chatId, r.game, r.msg || '', message);
    if (r.won) await announceWinner(sock, chatId, r.winner);
    return true;
  }
  if (raw === 'ludo_board') {
    const game = games.get(chatId);
    if (!game) return reply('❌ Is chat me koi Ludo game nahi hai. `.ludo` se banao.');
    await sendBoard(sock, chatId, game, '', message);
    return true;
  }
  return false;
}
async function announceWinner(sock, chatId, winner) {
  try {
    const vm = require('./voiceMode');
    if (vm.isEnabled() && vm.replyVoice()) {
      const spoken = await vm.speak(`${winner.name} Ludo jeet gaya! Badhai ho!`);
      if (spoken.ok) await sock.sendMessage(chatId, { audio: spoken.buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });
    }
  } catch (_) {}
}
function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    if (!mainSock) return;
    const now = Date.now();
    for (const [chatId, game] of [...games.entries()]) {
      try {
        if (game.phase === 'playing' && now - game.lastMoveAt > TURN_TIMEOUT_MS) {
          const p = currentPlayer(game);
          const prev = `${EMOJI[p.color]} ${p.name}`;
          nextTurn(game);
          sendBoard(mainSock, chatId, game, `⏰ *Time up!* ${prev} ne 2 minute me move nahi kiya — baari aage badh gayi.`).catch(() => {});
        } else if (now - game.lastMoveAt > IDLE_END_MS) {
          if (game.phase === 'playing' && game.pot > 0) {
            try { const eco = require('./economy'); game.players.forEach((pl) => eco.addCoins(pl.jid, game.entry)); } catch (_) {}
          }
          games.delete(chatId);
          mainSock.sendMessage(chatId, { text: '🎲 Ludo game 10 minute idle raha, isliye band kar diya. Entry fee refund kar di.' }).catch(() => {});
        }
      } catch (_) {}
    }
  }, 30000);
  if (timer.unref) timer.unref();
}

module.exports = {
  games, getGame, createGame, joinGame, startGame, rollDice, moveToken, leaveGame, endGame,
  renderBoard, statusText, sendBoard, sendButtons, handleButton, setSocket, startTimer,
  getStats, recordResult, currentPlayer, movableTokens, COLORS, EMOJI, LETTER,
};
