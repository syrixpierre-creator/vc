/**
 * QUEEN AKUMA — Elite AI multi-API
 */
module.exports = {
  command: 'eliteai',
  aliases: ['eai', 'elite', 'epai'],
  category: 'ai',
  description: 'AI via multi-API auto switch',
  usage: '.eliteai <question>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!text) return reply('🤖 Usage: `.eliteai your question`');
    await reply('⏳ Thinking...');
    try {
      const { ai } = require('../lib/apiSwitch');
      const ans = await ai(text);
      try { const { cleanText } = require('../lib/safeResponse'); ans = cleanText(ans); } catch {}
      if (!ans) return reply('❌ APIs busy/down. Baad me try karo.');
      return reply(`✨ *Elite AI*\n\n${String(ans).slice(0, 3500)}`);
    } catch (e) {
      return reply('❌ Error: ' + (e.message || e));
    }
  }
};
