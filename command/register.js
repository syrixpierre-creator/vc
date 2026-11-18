'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .register / .reg + .sn (QUEEN AKUMA port).
 * User registration + MD5 serial number. Local, no API.
 * Data: data/registered.json
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
function serialFor(jid) {
  return crypto.createHash('md5').update(String(jid)).digest('hex').slice(0, 12).toUpperCase();
}
function key(jid) { return String(jid || '').replace(/:\d+@/, '@').split('@')[0]; }

module.exports = {
  commands: [
    {
      command: 'register',
      aliases: ['reg'],
      description: 'Bot me register karo: .register <naam> <umar>',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const sender = message.key.participant || context.senderId;
        const k = key(sender);
        const store = load();
        const name = (args || [])[0];
        const age = parseInt((args || [])[1], 10);
        if (!name || !age || age < 5 || age > 120) {
          await reply('❌ Usage: *.register <naam> <umar>*\nExample: .register Inconnu 21');
          return;
        }
        if (store[k]) {
          await reply('✅ Tum pehle se registered ho!\n\n👤 Naam: ' + store[k].name + '\n🎂 Umar: ' + store[k].age + '\n🔑 Serial: ' + store[k].serial + '\n📅 ' + store[k].at);
          return;
        }
        const serial = serialFor(sender);
        store[k] = { name, age, serial, at: new Date().toISOString().slice(0, 10) };
        save(store);
        await reply('✅ *Registration ho gayi!*\n\n👤 Naam: ' + name + '\n🎂 Umar: ' + age + '\n🔑 Serial Number: *' + serial + '*\n\nSerial sambhaal ke rakho — .sn se kabhi bhi dekh sakte ho.');
      }
    },
    {
      command: 'sn',
      aliases: ['serial', 'myserial'],
      description: 'Apna registration serial number dikhao.',
      category: 'economy',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
        const sender = message.key.participant || context.senderId;
        const k = key(sender);
        const store = load();
        if (!store[k]) {
          await reply('❌ Tum registered nahi ho. Pehle *.register <naam> <umar>* karo.');
          return;
        }
        await reply('🔑 *Tumhara Serial*\n\n👤 ' + store[k].name + '\n🔑 Serial: *' + store[k].serial + '*');
      }
    }
  ]
};
