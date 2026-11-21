/**
 * QUEEN AKUMA • .botintro — bot ka introduction card (fakevCard ke saath).
 * Owner/channel details settings.js se aate hain, isliye .customize
 * se badla hua naam/channel yahan bhi dikhega.
 * Aliases: .about, .botinfo
 */
const settings = require('../settings');
const { buildFakeVCard } = require('../lib/fakevCard');

module.exports = {
  command: 'botintro',
  aliases: ['about', 'botinfo', 'intro-bot'],
  category: 'general',
  description: 'QUEEN AKUMA bot introduction card',
  usage: '.botintro',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let total = 0;
    try { total = require('../lib/commandHandler').commands.size || 0; } catch {}
    const uptime = Math.floor(process.uptime());
    const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60);
    const text = `🤖 *${settings.botName || 'QUEEN AKUMA'}*

👋 Hello! I am *${settings.botName || 'QUEEN AKUMA'}*, a multi-device WhatsApp bot.

👑 Owner: *${settings.botOwner || 'INCONNU BOY SENSEI'}*
📢 Channel: ${settings.channelLink || ''}
📦 Commands: ${total || ''}
⏱️ Uptime: ${h}h ${m}m
🔤 Prefix: ${(settings.prefixes || ['.']).join(' ')}

Type *.menu* to see the commands.`;
    try {
      const quoted = buildFakeVCard({
        displayName: settings.botName || 'QUEEN AKUMA',
        fn: settings.botOwner || 'INCONNU BOY SENSEI',
        org: settings.channelName || 'INCONNU BOY SENSEI',
        waid: settings.ownerNumber || '554488138425',
        pushName: settings.botName || 'QUEEN AKUMA',
      });
      await sock.sendMessage(chatId, { text }, { quoted });
    } catch {
      await sock.sendMessage(chatId, { text }, { quoted: message });
    }
  }
};
