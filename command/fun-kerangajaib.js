 'use strict';
/**
 * QUEEN AKUMA — .kulitkerangajaib : Magic Conch Shell (SpongeBob) — sawal poochho, kerang jawab dega.
 * Local random answers, no API. Fun command hai, game nahi.
 * Usage: .kulitkerangajaib <sawal>
 */
const ANSWERS = [
  'Ya, tentu saja! 🐚',
  'Tidak ❌',
  'Mungkin 🤔',
  'Coba lagi nanti ⏳',
  'Jangan harap 😅',
  'Sangat mungkin! ✨',
  'Kerang berkata: YA! 🎉',
  'Hmm... tidak yakin 🤷',
  'Pasti bisa! 💪',
  'Lebih baik jangan 🙅',
  'Tanyakan lagi besok 🌙',
  'Ya, kalau kamu berusaha 🔥',
];

module.exports = {
  command: 'kulitkerangajaib',
  aliases: [],
  category: 'fun',
  description: 'Magic Conch Shell se sawal poochho: .kulitkerangajaib <sawal>',
  usage: '.kulitkerangajaib <sawal>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const q = (args || []).join(' ').trim();
    if (!q) {
      await reply('🐚 *Kulit Kerang Ajaib*\n\nSawal to poochho!\nUsage: `.kulitkerangajaib kya aaj barish hogi?`');
      return;
    }
    const ans = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await reply('🐚 *Kulit Kerang Ajaib*\n\n❓ ' + q + '\n💬 ' + ans);
  },
};
