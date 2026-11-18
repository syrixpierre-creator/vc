 'use strict';
/**
 * QUEEN AKUMA — .addprem : premium user add karo (owner-only).
 * Store: data/premium.json (same store jo .cekprem / .delpremuser use karte hain).
 * NOTE: registry me .addprem new_addprem.js (compat wrapper) ke paas hai — ye file
 * uska native target hai (lib/compat_native.json), isliye handler yahin real hai.
 * Usage: .addprem <number | @user | reply> [days]
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
  command: 'addprem',
  aliases: [],
  category: 'owner',
  description: 'Premium user add karo (owner-only): .addprem <number> [days]',
  usage: '.addprem <number|@user|reply> [days]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    let num = digits((args || [])[0] || '');
    if (!num && ctxInfo.mentionedJid && ctxInfo.mentionedJid[0]) num = digits(ctxInfo.mentionedJid[0]);
    if (!num && ctxInfo.participant) num = digits(ctxInfo.participant);
    let days = null;
    for (const x of (args || []).slice(1)) {
      if (/^\d+$/.test(String(x))) days = parseInt(x, 10);
    }
    if (!num || num.length < 10) {
      await reply('👑 *Add Premium*\n\nUsage: `.addprem 919876543210 [days]`\nya user ko mention/reply karke bhejo.');
      return;
    }
    const list = load();
    if (list.some((e) => digits(jidOf(e)) === num)) {
      await reply('ℹ️ +' + num + ' pehle se premium hai.\nList: `.cekprem`');
      return;
    }
    list.push({ jid: num + '@s.whatsapp.net', since: new Date().toISOString(), days });
    save(list);
    await reply('✅ *Premium add hua*\n\n📱 +' + num + (days ? '\n⏳ ' + days + ' din ke liye' : '\n⏳ Lifetime') + '\nTotal premium users: ' + list.length);
  },
};
