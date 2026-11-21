 'use strict';
/**
 * QUEEN AKUMA — .gpass : strong password generator (local, no API).
 * Usage: .gpass [length 4-64] [all|alpha|num|pin]
 * Default: 12 chars, letters + digits + symbols.
 */
const crypto = require('crypto');

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

function randChar(str) { return str[crypto.randomInt(str.length)]; }

module.exports = {
  command: 'gpass',
  aliases: [],
  category: 'tools',
  description: 'Strong password banao: .gpass [length] [all|alpha|num|pin]',
  usage: '.gpass [length] [all|alpha|num|pin]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const a = (args || []).map((x) => String(x).toLowerCase());
    let len = 12;
    let mode = 'all';
    let lenGiven = false;
    for (const x of a) {
      if (/^\d+$/.test(x)) { len = parseInt(x, 10); lenGiven = true; }
      else if (['all', 'alpha', 'letters', 'num', 'digits', 'pin', 'symbols'].includes(x)) mode = x;
    }
    if (mode === 'pin' && !lenGiven) len = 6;
    if (mode === 'pin') len = Math.min(Math.max(len, 4), 8);
    else len = Math.min(Math.max(len, 4), 64);
    let pools;
    if (mode === 'alpha' || mode === 'letters') pools = [SETS.lower, SETS.upper];
    else if (mode === 'num' || mode === 'digits' || mode === 'pin') pools = [SETS.digits];
    else pools = [SETS.lower, SETS.upper, SETS.digits, SETS.symbols];
    const out = pools.map((p) => randChar(p));
    const all = pools.join('');
    while (out.length < len) out.push(randChar(all));
    for (let i = out.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    const pass = out.join('');
    await reply('🔐 *Password Generator*\n\n`' + pass + '`\n\n📏 Length: ' + len + ' • Mode: ' + mode + '\n⚠️ Do not share this password.');
  },
};
