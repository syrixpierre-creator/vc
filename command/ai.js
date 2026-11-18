
module.exports = {
  command: 'ai',
  aliases: ['gpt', 'ask'],
  category: 'ai',
  description: 'AI chat',
  usage: '.ai <question>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const q = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!q) return reply('❌ `.ai <question>`');
    await reply('⏳ Thinking...');
    try {
      let ans = null;
      try { const { ai } = require('../lib/apiSwitch'); ans = await ai(q); } catch {}
      if (!ans) {
        try { const { call } = require('../lib/eliteApi'); const d = await call('gemini', q); ans = d.result || d.response || d; } catch {}
      }
      try { const { cleanText } = require('../lib/safeResponse'); ans = cleanText(ans); } catch {}
      if (!ans) return reply('❌ AI APIs busy. Try `.eliteai` or `.epgemini`');
      return reply('🤖 *AI*\n\n' + String(ans).slice(0, 3500));
    } catch (e) {
      return reply('❌ ' + (e.message || e));
    }
  }
};
