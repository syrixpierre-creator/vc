/**
 * QUEEN AKUMA • .ping — Pong with the QUEEN AKUMA card (v2.8.7)
 * Screenshot style: fake contact card "© MADE BY INCONNU BOY SENSEI" (lib/fakevCard)
 * + link preview "QUEEN AKUMA / MADE BY INCONNU BOY SENSEI / whatsapp.com", then
 * "🏓 Pong!" + "Latency: Xms".
 */
const { demonAdReply } = require('../lib/fakevCard');

module.exports = {
  command: 'ping',
  aliases: ['p', 'pong'],
  category: 'general',
  description: 'Check bot response time',
  usage: '.ping',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const start = Date.now();
    const sent = await sock.sendMessage(chatId, { text: '🏓 Pinging...' }, { quoted: message });
    const ms = Date.now() - start;
    const pongText = `🏓 *Pong!*\n\n⚡ *Speed:* ${ms}ms`;
    try {
      await sock.sendMessage(chatId, {
        text: pongText,
        edit: sent.key
      });
    } catch {
      await sock.sendMessage(chatId, {
        text: pongText
      }, { quoted: message });
    }
  }
};
