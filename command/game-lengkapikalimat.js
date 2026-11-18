/**
 * QUEEN AKUMA • .lengkapikalimat — real quiz game (lib/quizGame.js engine).
 * Pehle ye sirf stub tha ("Game command ready") — ab asli sawal bhejta
 * hai aur jawab check karta hai. Original 1520 plugins ka logic hai,
 * QUEEN AKUMA ke native handler me likha hua.
 */
const quiz = require('../lib/quizGame');
module.exports = {
  command: 'lengkapikalimat',
  aliases: [],
  category: 'game',
  description: 'Play lengkapikalimat quiz game',
  usage: '.lengkapikalimat',
  async handler(sock, message, args, context = {}) {
    try { await quiz.start(sock, message, 'lengkapikalimat'); }
    catch (e) { await sock.sendMessage(context.chatId || message.key.remoteJid, { text: '❌ Game start nahi hua: ' + (e.message || e) }, { quoted: message }); }
  }
};
