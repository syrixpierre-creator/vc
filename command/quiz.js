/**
 * QUEEN AKUMA • .quiz — active quiz games dikhao.
 * Answers plain text me likhe jate hain (prefix nahi), lib/quizGame.js
 * unhe check karta hai. Yahan sirf status/help hai.
 */
const quiz = require('../lib/quizGame');
module.exports = {
  command: 'quiz',
  aliases: ['games', 'tebak'],
  category: 'game',
  description: 'Show active quiz games in this chat',
  usage: '.quiz',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const list = quiz.listActive().filter((g) => g.chat === chatId);
    if (!list.length) {
      await sock.sendMessage(chatId, { text: `🎮 *Quiz Games*\n\nIs chat me koi game active nahi hai.\n\nStart karo:\n• .tebakgambar — guess the picture\n• .tebakan — riddle\n• .tebaktebakan — joke riddle\n• .tebaklirik — guess the song\n• .tebakmakanan — guess the food\n• .susunkata — unscramble word\n• .caklontong — cak lontong riddle\n• .family100 — survey game\n• .asahotak — brain teaser\n• .lengkapikalimat — fill the blank\n\nJawab plain text me likho. Hint: .hint • Menyerah: .nyerah` }, { quoted: message });
      return;
    }
    await sock.sendMessage(chatId, { text: `🎮 *Active game:* ${list.map((g) => g.title).join(', ')}\n\nJawab plain text me likho.\n💡 Hint: .hint  •  🏳️ Menyerah: .nyerah` }, { quoted: message });
  }
};
