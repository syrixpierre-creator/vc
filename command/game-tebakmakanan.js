/**
 * QUEEN AKUMA • .tebakmakanan — real quiz game (lib/quizGame.js engine).
 * Pehle ye sirf stub tha ("Game command ready") — ab asli sawal bhejta
 * hai aur jawab check karta hai. Original 1520 plugins ka logic hai,
 * QUEEN AKUMA ke native handler me likha hua.
 */
const quiz = require('../lib/quizGame');
module.exports = {
  command: 'tebakmakanan',
  aliases: [],
  category: 'game',
  description: 'Play tebakmakanan quiz game',
  usage: '.tebakmakanan',
  async handler(sock, message, args, context = {}) {
    try { await quiz.start(sock, message, 'tebakmakanan'); }
    catch (e) { await sock.sendMessage(context.chatId || message.key.remoteJid, { text: '❌ *Failed to start the game:* ' + (e.message || e) }, { quoted: message }); }
  }
};
