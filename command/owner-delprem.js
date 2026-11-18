 'use strict';
/**
 * QUEEN AKUMA — .delpremuser : premium se hatao (owner-only).
 * Store: data/premium.json (same store jo .cekprem / .addprem use karte hain).
 * Usage: .delpremuser <number | @user | reply>
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'premium.json');
const digits = (s) => String(s || '').replace(/\D/g, '');

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(d) ? d : [];
  } catch (e) { return []; }
}
function save(list) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}
function jidOf(e) {
  if (typeof e === 'string') return e;
  return String((e && (e.jid || e.number)) || '');
}

module.exports = {
  command: 'delpremuser',
  aliases: [],
  category: 'owner',
  description: 'Premium se hatao (owner-only): .delpremuser <number|@user|reply>',
  usage: '.delpremuser <number|@user|reply>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    let num = digits((args || [])[0] || '');
    if (!num && ctxInfo.mentionedJid && ctxInfo.mentionedJid[0]) num = digits(ctxInfo.mentionedJid[0]);
    if (!num && ctxInfo.participant) num = digits(ctxInfo.participant);
    if (!num || num.length < 10) {
      await reply('👑 *Del Premium*\n\nUsage: `.delpremuser 919876543210`\nya user ko mention/reply karke bhejo.');
      return;
    }
    const list = load();
    const kept = list.filter((e) => digits(jidOf(e)) !== num);
    if (kept.length === list.length) {
      await reply('ℹ️ +' + num + ' premium me hai hi nahi.\nList dekhne ke liye: `.cekprem`');
      return;
    }
    save(kept);
    await reply('✅ *Premium hataya*\n\n📱 +' + num + ' ab premium nahi raha.\nBache hue premium users: ' + kept.length);
  },
};
