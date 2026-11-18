'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .structure / .tree (Flash port).
 * Bot ki file/folder tree dikhao. Owner-only.
 * Depth 3, node_modules/.git/session skip. Lambi ho to .txt document.
 */
const fs = require('fs');
const path = require('path');

const BOT_ROOT = path.join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'session', '.cache']);
const MAX_DEPTH = 3;

function walk(dir, prefix, depth, lines) {
  if (depth > MAX_DEPTH || lines.length > 400) return;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  entries.sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? -1 : 1));
  entries.forEach((en, i) => {
    if (SKIP.has(en.name)) return;
    const last = i === entries.length - 1;
    const branch = last ? ' ' : ' ';
    lines.push(prefix + branch + en.name + (en.isDirectory() ? '/' : ''));
    if (en.isDirectory()) walk(path.join(dir, en.name), prefix + (last ? '    ' : '   '), depth + 1, lines);
  });
}

module.exports = {
  command: 'structure',
  aliases: ['tree', 'filestree'],
  description: 'Bot ki file/folder tree dikhao (owner-only).',
  category: 'owner',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const lines = ['QUEEN-AKUMA/'];
    walk(BOT_ROOT, '', 1, lines);
    const text = lines.join('\n');
    if (text.length > 3500) {
      await sock.sendMessage(chatId, { document: Buffer.from(text, 'utf8'), mimetype: 'text/plain', fileName: 'QUEEN-AKUMA-structure.txt' }, { quoted: message });
    } else {
      await reply('```\n' + text + '\n```');
    }
  }
};
