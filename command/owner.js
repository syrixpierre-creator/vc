const settings = require('../settings');
module.exports = {
  command: 'owner',
  aliases: ['creator', 'developer'],
  category: 'info',
  description: 'Show bot owner',
  usage: '.owner',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const num = String(settings.ownerNumber || '').replace(/\D/g, '');
    const name = settings.botOwner || 'Owner';
    const bot = settings.botName || 'QUEEN AKUMA';
    let text = `👑 *${bot} Owner*\n\nName: *${name}*\nNumber: ${num ? '+' + num : 'N/A'}`;
    try {
      if (num) {
        await sock.sendMessage(chatId, {
          contacts: {
            displayName: name,
            contacts: [{
              vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${num}:+${num}\nEND:VCARD`
            }]
          }
        }, { quoted: message });
      }
    } catch (_) {}
    await sock.sendMessage(chatId, { text }, { quoted: message });
  }
};
