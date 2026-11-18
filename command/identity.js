/** Owner identity setters: .setbotname .setownername .setownernumber .setchannellink (persisted in data/identity.json) */
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const FILE = path.join(process.cwd(), 'data', 'identity.json');

function save(key, value) {
  let o = {};
  try { o = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) {}
  o[key] = value;
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(o, null, 2));
  settings[key] = value; // apply immediately
}

function make(command, aliases, key, label, validate) {
  return {
    command, aliases, category: 'owner', ownerOnly: true,
    description: `Set ${label} (saved permanently)`,
    usage: `.${command} <value>`,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      const value = args.join(' ').trim();
      if (!value) return reply(`Usage: \`.${command} <value>\`\nCurrent ${label}: *${settings[key] || '-'}*`);
      const v = validate ? validate(value) : value;
      if (v === null) return reply(`❌ Invalid ${label}.`);
      save(key, v);
      return reply(`✅ ${label} updated:\n*${v}*`);
    }
  };
}

const botName = make('setbotname', ['botname', 'changebotname'], 'botName', 'bot name', (v) => (v.length <= 40 ? v : null));
module.exports = {
  ...botName,
  commands: [
    make('setownername', ['ownername', 'setbotowner'], 'botOwner', 'owner name', (v) => (v.length <= 40 ? v : null)),
    make('setownernumber', ['ownernumber'], 'ownerNumber', 'owner number', (v) => { const d = v.replace(/\D/g, ''); return d.length >= 8 && d.length <= 15 ? d : null; }),
    make('setchannellink', ['channellink', 'setchannel'], 'channelLink', 'channel link', (v) => (/^https?:\/\/(www\.)?(whatsapp\.com\/channel|chat\.whatsapp\.com)\//i.test(v) ? v : null))
  ]
};
