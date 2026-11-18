 'use strict';
/**
 * QUEEN AKUMA — .addlimituser : user ki command limit badhao (owner-only).
 * Store: data/legacy_db.json — legacy (compat) user DB, wahi jahan .limit padhta hai
 * (users[jid].limit, default 9999). Usage: .addlimituser <number|@user> [amount=100]
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'legacy_db.json');
const digits = (s) => String(s || '').replace(/\D/g, '');

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (d && typeof d === 'object') { d.users = d.users || {}; return d; }
  } catch (e) {}
  return { users: {} };
}
function save(d) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
}

module.exports = {
  command: 'addlimituser',
  aliases: [],
  category: 'owner',
  description: 'User ki limit badhao (owner-only): .addlimituser <number> [amount]',
  usage: '.addlimituser <number|@user> [amount]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const isOwner = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
    if (!isOwner) { await reply('🚫 *You are not authorized to use this command!*'); return; }
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    let num = digits((args || [])[0] || '');
    if (!num && ctxInfo.mentionedJid && ctxInfo.mentionedJid[0]) num = digits(ctxInfo.mentionedJid[0]);
    if (!num && ctxInfo.participant) num = digits(ctxInfo.participant);
    let amount = 100;
    for (const x of (args || []).slice(1)) {
      if (/^\d+$/.test(String(x))) amount = parseInt(x, 10);
    }
    amount = Math.min(Math.max(amount, 1), 10000);
    if (!num || num.length < 10) {
      await reply('🎚️ *Add Limit*\n\nUsage: `.addlimituser 919876543210 [amount]`\nDefault amount: 100');
      return;
    }
    const jid = num + '@s.whatsapp.net';
    const db = load();
    const u = db.users[jid] || {};
    u.limit = (typeof u.limit === 'number' ? u.limit : 0) + amount;
    db.users[jid] = u;
    save(db);
    await reply('✅ *Limit add hui*\n\n📱 +' + num + '\n➕ +' + amount + ' limit\n📊 Total limit ab: ' + u.limit);
  },
};
