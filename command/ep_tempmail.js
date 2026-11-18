/**
 * EliteProTech API — .eptempmail  (https://eliteprotech-apis.zone.id/tempmail)
 */
module.exports = {
  command: 'eptempmail',
  aliases: ['elitetempmail', 'tempmailep'],
  category: 'eliteapi',
  description: 'EliteProTech tempmail API',
  usage: '.eptempmail <input>',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = (args || []).join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const { call } = require('../lib/eliteApi');
    const { cleanText, safeReplyText } = require('../lib/safeResponse');
    if ([].length && !text) {
      return reply('❌ Usage: `.eptempmail <none>`\nAPI: eliteprotech-apis.zone.id/tempmail');
    }
    await reply('⏳ Elite API `tempmail`...');
    try {
      const data = await call('tempmail', text);
      let out = data.result ?? data.response ?? data.message ?? data.data ?? data;
      if (typeof out === 'object') out = JSON.stringify(out, null, 2);
      out = cleanText(out);
      if (!out) return reply('❌ API returned invalid/HTML response. Try later.');
      out = out.slice(0, 3500);
      // media urls
      const urlMatch = out.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp|mp4|mp3|m4a)/i);
      if (urlMatch) {
        const mediaUrl = urlMatch[0];
        if (/\.(mp4)/i.test(mediaUrl)) {
          await sock.sendMessage(chatId, { video: { url: mediaUrl }, caption: '✅ *tempmail*' }, { quoted: message });
          return;
        }
        if (/\.(mp3|m4a)/i.test(mediaUrl)) {
          await sock.sendMessage(chatId, { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' }, { quoted: message });
          return;
        }
        if (/\.(jpg|jpeg|png|gif|webp)/i.test(mediaUrl)) {
          await sock.sendMessage(chatId, { image: { url: mediaUrl }, caption: '✅ *tempmail*' }, { quoted: message });
          return;
        }
      }
      return reply('✅ *Elite tempmail*\n\n' + out);
    } catch (e) {
      return reply('❌ Elite API error: ' + (e.message || e) + '\n\nNote: API down ho to baad me try karo.\nhttps://eliteprotech-apis.zone.id');
    }
  }
};
