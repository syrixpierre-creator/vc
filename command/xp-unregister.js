 'use strict';
/**
 * QUEEN AKUMA — .unregister : apni registration hatao (data/registered.json se delete).
 * Same store + same key() jo .register use karta hai.
 * Usage: .unregister
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'registered.json');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return {}; }
}
function save(d) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
  } catch (e) {}
}
function key(jid) { return String(jid || '').replace(/:\d+@/, '@').split('@')[0]; }

module.exports = {
  command: 'unregister',
  aliases: [],
  category: 'main',
  description: 'Apni registration hatao: .unregister',
  usage: '.unregister',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sender = message.key.participant || context.senderId || message.key.remoteJid;
    const k = key(sender);
    const store = load();
    if (!store[k]) {
      await reply('ℹ️ Tum registered hi nahi ho.\nRegister karne ke liye: `.register <naam> <umar>`');
      return;
    }
    const name = store[k].name || k;
    delete store[k];
    save(store);
    await reply('✅ *Unregistered*\n\n👤 ' + name + ' — tumhari registration hata di gayi.\nDobara register karne ke liye: `.register <naam> <umar>`');
  },
};
