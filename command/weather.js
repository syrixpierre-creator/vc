/**
 * QUEEN AKUMA • .weather — real weather (Open-Meteo, free, no API key).
 * Pehle ye sirf AI-fallback stub tha — ab asli live data deta hai.
 * Usage: .weather <city>  (jaise .weather Delhi, .weather Mumbai)
 */
const { getWeather, formatWeather } = require('../lib/smartTools');

module.exports = {
  command: 'weather',
  aliases: ['forecast', 'climate', 'mausam'],
  category: 'info',
  description: 'Live weather of any city (no API key needed)',
  usage: '.weather <city>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const city = (args || []).join(' ').trim();
    if (!city) return reply('🌤️ *Weather*\n\nUsage: .weather <city>\nExample: .weather Delhi\nExample: .weather New York');
    try {
      const w = await getWeather(city);
      await reply(formatWeather(w));
    } catch (e) {
      await reply('❌ *Weather not found:* ' + String((e && e.message) || e).slice(0, 200) + '\nSahi city naam likho, jaise: .weather Delhi');
    }
  }
};
