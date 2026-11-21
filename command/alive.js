const os = require('os');
const settings = require('../settings');
const { withButtons } = require('../lib/buttons');

module.exports = {
  command: 'alive',
  aliases: ['status', 'botstatus'],
  category: 'general',
  description: 'Check bot status',
  usage: '.alive',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const up = process.uptime();
    const h = Math.floor(up / 3600);
    const m = Math.floor((up % 3600) / 60);
    const s = Math.floor(up % 60);
    const ram = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
    const total = (os.totalmem() / 1024 / 1024).toFixed(0);
    const name = settings.botName || 'QUEEN AKUMA';
    const text =
`✅ *${name} is Alive!*

⏱ Uptime: ${h}h ${m}m ${s}s
💾 RAM: ${ram}/${total} MB
🖥 Platform: ${os.platform()}
👑 Owner: ${settings.botOwner || 'Owner'}`;
    await sock.sendMessage(chatId, withButtons({ text }, [['menu', '🗂️ Menu'], ['ping', '📈 Ping'], ['owner', '👑 Owner']]), { quoted: message });
  }
};
