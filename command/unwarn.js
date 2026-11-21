const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const warningsPath = path.join(process.cwd(), 'data', 'warnings.json');

function load() {
  try {
    if (!fs.existsSync(warningsPath)) return {};
    return JSON.parse(fs.readFileSync(warningsPath, 'utf8')) || {};
  } catch { return {}; }
}
function save(data) {
  const dir = path.dirname(warningsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(warningsPath, JSON.stringify(data, null, 2));
}

function targetUser(message, args) {
  const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mentioned && mentioned[0]) return mentioned[0];
  const p = message.message?.extendedTextMessage?.contextInfo?.participant;
  if (p) return p;
  if (args[0] && args[0].replace(/\D/g, '').length >= 8) {
    return args[0].replace(/\D/g, '') + '@s.whatsapp.net';
  }
  return null;
}

module.exports = {
  command: 'unwarn',
  aliases: ['delwarn', 'removewarn'],
  category: 'admin',
  description: 'Remove one warning from user',
  usage: '.unwarn @user / reply',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    const st = await isAdmin(sock, chatId, sender);
    if (!st.isSenderAdmin) {
      return sock.sendMessage(chatId, { text: '❌ Admin only.' }, { quoted: message });
    }
    const user = targetUser(message, args);
    if (!user) {
      return sock.sendMessage(chatId, { text: '❌ User mention/reply karo.\n`.unwarn @user`' }, { quoted: message });
    }
    const data = load();
    const key = chatId;
    data[key] = data[key] || {};
    const u = user.split(':')[0];
    const cur = data[key][u] || data[key][user] || 0;
    if (!cur) {
      return sock.sendMessage(chatId, { text: '❌ *This user has 0 warns.*' }, { quoted: message });
    }
    const next = Math.max(0, Number(cur) - 1);
    data[key][u] = next;
    save(data);
    return sock.sendMessage(chatId, {
      text: `✅ Warning hata di.\nUser: @${u.split('@')[0]}\nWarns: *${next}*`,
      mentions: [user]
    }, { quoted: message });
  }
};
