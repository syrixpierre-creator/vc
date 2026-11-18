/** QUEEN AKUMA Plugin Store — .motivate (zenquotes API, free) */
const axios = require('axios');
const FALLBACK = [
  ['Mehnat kabhi bekar nahi jati.', 'QUEEN AKUMA'],
  ['Chhota kadam bhi manzil ki taraf hota hai.', 'QUEEN AKUMA'],
  ['Jo aaj karega, kal uska hoga.', 'QUEEN AKUMA'],
];
module.exports = {
  command: 'motivate',
  aliases: ['motivation'],
  category: 'fun',
  description: 'Ek motivational quote bhejo',
  usage: '.motivate',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    try {
      const r = await axios.get('https://zenquotes.io/api/random', { timeout: 10000 });
      const q = r.data && r.data[0];
      if (q && q.q) return reply(`💪 *Motivation*\n\n_"${q.q}"_\n— ${q.a || 'Unknown'}`);
    } catch (_) {}
    const [q, a] = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    return reply(`💪 *Motivation*\n\n_"${q}"_\n— ${a}`);
  }
};
