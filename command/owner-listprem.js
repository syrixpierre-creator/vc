 'use strict';
/**
 * QUEEN AKUMA — .cekprem : premium users ki list (owner-only).
 * Store: data/premium.json — array of JIDs ya {jid, since, days} objects.
 * Add: .addprem | Remove: .delpremuser
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'premium.json');

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(d) ? d : [];
  } catch (e) { return []; }
}
function jidOf(e) {
  if (typeof e === 'string') return e;
  return String((e && (e.jid || e.number)) || '');
}
function normJid(e) {
  const j = jidOf(e);
  const d = j.replace(/\D/g, '');
  return d ? d + '@s.whatsapp.net' : '';
}

module.exports = {
  command: 'cekprem',
  aliases: [],
  category: 'owner',
  description: 'Premium users ki list (owner-only): .cekprem',
  usage: '.cekprem',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const list = load().filter((e) => jidOf(e));
    if (!list.length) {
      await reply('👑 *Premium Users (0)*\n\nKoi premium user nahi hai.\nAdd karne ke liye: `.addprem <number>`');
      return;
    }
    const mentions = [];
    const lines = list.map((e, i) => {
      const j = normJid(e);
      const num = j.split('@')[0];
      if (j) mentions.push(j);
      const since = (e && typeof e === 'object' && (e.since || e.addedAt)) ? ' — ' + String(e.since || e.addedAt).slice(0, 10) : '';
      const days = (e && typeof e === 'object' && e.days) ? ' • ' + e.days + ' din' : '';
      return (i + 1) + '. @' + num + since + days;
    });
    await sock.sendMessage(chatId, {
      text: '👑 *Premium Users (' + list.length + ')*\n\n' + lines.join('\n'),
      mentions,
    }, { quoted: message });
  },
};
