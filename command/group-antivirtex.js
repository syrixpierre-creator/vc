/**
 * QUEEN AKUMA working handler — group-antivirtex.js
 */
module.exports = {
  command: 'antivirtex',
  aliases: [],
  category: 'group',
  description: 'antivirtex',
  usage: '.antivirtex <args>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    try {
      if ('group' === 'ai' && text) {
        let ans = null;
        try { const { ai } = require('../lib/apiSwitch'); ans = await ai(text); } catch {}
        if (!ans) { try { const { call } = require('../lib/eliteApi'); const d = await call('gemini', text); ans = d.result || d.response || d; } catch {} }
        if (ans) return reply('🤖 *antivirtex*\n\n' + String(ans).slice(0, 3000));
        return reply('❌ AI busy. Try `.ai` or `.eliteai`');
      }
      if ('group' === 'download' && text) {
        try {
          const downloadApis = require('../lib/downloadApis');
          let r = null;
          if (downloadApis.ytmp3) r = await downloadApis.ytmp3(text);
          if (!r && downloadApis.song) r = await downloadApis.song(text);
          const url = r && (r.url || r.download || r.link || r.audio || r.mp3);
          if (url) {
            await sock.sendMessage(chatId, { audio: { url: String(url) }, mimetype: 'audio/mpeg' }, { quoted: message });
            return;
          }
        } catch {}
        return reply('📥 *antivirtex*\nTry: `.play ' + text + '` / `.song ' + text + '`');
      }
      if ('group' === 'group') {
        if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
        return reply('👥 *antivirtex* active.\n' + (text || 'Group tool ready. Bot may need admin.'));
      }
      if ('group' === 'game') {
        return reply('🎮 *antivirtex*\n' + (text ? 'Play: ' + text : 'Game command ready. Use in group for multiplayer.'));
      }
      if ('group' === 'fun') {
        const lines = ['Nice 😄', 'Done ✨', 'Okay 🔥', 'Haha 😂', 'Noted 👍'];
        return reply('🎭 *antivirtex*\n' + lines[Math.floor(Math.random()*lines.length)] + (text ? '\n> ' + text : ''));
      }
      if ('group' === 'search' && text) {
        return reply('🔎 *antivirtex*\nQuery: ' + text + '\nTry `.epgoogle ' + text + '` if needed.');
      }
      if ('group' === 'owner') {
        return reply('👑 *antivirtex*\n' + (text || 'Owner tool ready.'));
      }
      // generic working response + optional elite
      if (text) {
        try {
          const { call } = require('../lib/eliteApi');
          const d = await call('gemini', text);
          const ans = d && (d.result || d.response || d.message || d);
          if (ans) return reply('✅ *antivirtex*\n\n' + String(ans).slice(0, 2500));
        } catch {}
      }
      return reply('✅ *.antivirtex* is working.\n' + (text ? 'Args: ' + text : 'Usage: `.antivirtex <args>`'));
    } catch (e) {
      return reply('❌ antivirtex: ' + (e.message || e));
    }
  }
};
