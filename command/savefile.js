'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .savefile / .sf (bot-md port).
 * WhatsApp se plugin hot-patch karo. Owner-only.
 * Usage: code wale message pe reply karke .savefile command/mera-plugin.js
 *    ya: .savefile command/x.js <code...>
 * Guard: sirf bot dir ke andar, no .., no .env/session, .js/.json/.md/.txt only.
 * .js save karne par node --check se syntax verify karta hai.
 */
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const BOT_ROOT = path.join(__dirname, '..');
const ALLOWED_EXT = new Set(['.js', '.json', '.md', '.txt']);
const ALLOWED_DIRS = new Set(['command', 'lib', 'data']);

function safeResolve(rel) {
  const clean = String(rel || '').trim().replace(/\\/g, '/');
  if (!clean || clean.startsWith('/') || clean.includes('..')) return null;
  const parts = clean.split('/').filter(Boolean);
  if (parts.length < 2 || !ALLOWED_DIRS.has(parts[0])) return null;
  if (parts.includes('session') || parts.includes('.env')) return null;
  if (!ALLOWED_EXT.has(path.extname(parts[parts.length - 1]).toLowerCase())) return null;
  const abs = path.join(BOT_ROOT, ...parts);
  if (!abs.startsWith(BOT_ROOT)) return null;
  return abs;
}

module.exports = {
  command: 'savefile',
  aliases: ['savefileplugins'],
  description: 'WhatsApp se file save karo (owner-only hot-patch).',
  category: 'owner',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const isOwner = context.isOwnerOrSudoCheck || context.senderIsOwnerOrSudo;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const rel = (args || [])[0];
    if (!rel) {
      await reply('❌ Usage: *.savefile command/mera-plugin.js*\nCode wale message pe reply karke chalao, ya code args me likho.\nAllowed: command/*.js, lib/*.js, data/*.json');
      return;
    }
    const abs = safeResolve(rel);
    if (!abs) {
      await reply('❌ Galat path. Sirf ye allowed hain: command/*.js, lib/*.js, data/*.json — no .., no .env, no session.');
      return;
    }
    // Content: quoted message ka text, ya args ke baaki hisse
    let content = null;
    const qm = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.quotedMessage;
    if (qm) {
      content = qm.conversation || (qm.extendedTextMessage && qm.extendedTextMessage.text) || '';
      // document ke roop me aaya ho to download karo
      if (!content && qm.documentMessage) {
        try {
          const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
          const stream = await downloadContentFromMessage(qm.documentMessage, 'document');
          const chunks = [];
          for await (const c of stream) chunks.push(c);
          content = Buffer.concat(chunks).toString('utf8');
        } catch (e) {}
      }
    }
    if (!content) content = (args || []).slice(1).join(' ');
    if (!content || !content.trim()) {
      await reply('❌ Koi content nahi mila. Code wale message pe reply karo ya args me code likho.');
      return;
    }
    try {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content, 'utf8');
      if (abs.endsWith('.js')) {
        const ok = await new Promise((resolve) => {
          execFile(process.execPath, ['--check', abs], { timeout: 15000 }, (err) => resolve(!err));
        });
        if (!ok) {
          await reply('⚠️ File save ho gayi (' + rel + ') lekin *syntax error* hai — node --check fail hua. Check karke dobara save karo, warna bot crash ho sakta hai.');
          return;
        }
      }
      if (abs.endsWith('.json')) {
        try { JSON.parse(content); } catch (e) {
          await reply('⚠️ File save ho gayi (' + rel + ') lekin *JSON invalid* hai: ' + e.message.slice(0, 100));
          return;
        }
      }
      await reply('✅ Save ho gaya: *' + rel + '* (' + Buffer.byteLength(content) + ' bytes)\nLoad karne ke liye bot restart karo (.restart).');
    } catch (e) {
      await reply('❌ Save nahi ho paya: ' + String(e.message || e).slice(0, 150));
    }
  }
};
