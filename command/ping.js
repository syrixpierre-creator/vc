/**
 * QUEEN AKUMA • .ping — Pong with the QUEEN AKUMA card (v2.8.7)
 * Screenshot style: fake contact card "© MADE BY INCONNU BOY SENSEI" (lib/fakevCard)
 * + link preview "QUEEN AKUMA / MADE BY INCONNU BOY SENSEI / whatsapp.com", then
 * "🏓 Pong!" + "Latency: Xms".
 */
const { withButtons } = require('../lib/buttons');

module.exports = {
  command: 'ping',
  aliases: ['p', 'pong'],
  category: 'general',
  description: 'Check bot response time',
  usage: '.ping',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const start = Date.now();
    try { await sock.sendMessage(chatId, { react: { text: '🏓', key: message.key } }); } catch (_) {}
    const ms = Date.now() - start;
    await sock.sendMessage(chatId, withButtons({ text: `🏓 *Pong!*\n\n⚡ *Speed:* ${ms}ms` }, [['menu', '🗂️ Menu'], ['alive', '💓 Alive']]), { quoted: message });
  }
};
