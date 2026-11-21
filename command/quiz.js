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
      await sock.sendMessage(chatId, { text: `❌ *No game active in this chat.*\n\nAvailable games:\n- .tebakgambar\n- .tebakan\n- .tebaktebakan\n- .tebaklirik\n- .tebakmakanan\n- .susunkata\n- .caklontong\n- .family100\n- .asahotak\n- .lengkapikalimat` }, { quoted: message });
      return;
    }
    await sock.sendMessage(chatId, { text: `🎮 *Active game:* ${list.map((g) => g.title).join(', ')}\n\nJawab plain text me likho.\n💡 Hint: .hint  •  🏳️ Menyerah: .nyerah` }, { quoted: message });
  }
};
