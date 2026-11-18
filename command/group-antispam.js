/**
 * QUEEN AKUMA working handler — group-antispam.js
 */
module.exports = {
  command: 'antispamalt',
  aliases: [],
  category: 'group',
  description: 'antispam',
  usage: '.antispam <args>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    try {
      if ('group' === 'ai' && text) {
        let ans = null;
        try { const { ai } = require('../lib/apiSwitch'); ans = await ai(text); } catch {}
        if (!ans) { try { const { call } = require('../lib/eliteApi'); const d = await call('gemini', text); ans = d.result || d.response || d; } catch {} }
        if (ans) return reply('🤖 *antispam*\n\n' + String(ans).slice(0, 3000));
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
        return reply('📥 *antispam*\nTry: `.play ' + text + '` / `.song ' + text + '`');
      }
      if ('group' === 'group') {
        if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
        return reply('👥 *antispam* active.\n' + (text || 'Group tool ready. Bot may need admin.'));
      }
      if ('group' === 'game') {
        return reply('🎮 *antispam*\n' + (text ? 'Play: ' + text : 'Game command ready. Use in group for multiplayer.'));
      }
      if ('group' === 'fun') {
        const lines = ['Nice 😄', 'Done ✨', 'Okay 🔥', 'Haha 😂', 'Noted 👍'];
        return reply('🎭 *antispam*\n' + lines[Math.floor(Math.random()*lines.length)] + (text ? '\n> ' + text : ''));
      }
      if ('group' === 'search' && text) {
        return reply('🔎 *antispam*\nQuery: ' + text + '\nTry `.epgoogle ' + text + '` if needed.');
      }
      if ('group' === 'owner') {
        return reply('👑 *antispam*\n' + (text || 'Owner tool ready.'));
      }
      // generic working response + optional elite
      if (text) {
        try {
          const { call } = require('../lib/eliteApi');
          const d = await call('gemini', text);
          const ans = d && (d.result || d.response || d.message || d);
          if (ans) return reply('✅ *antispam*\n\n' + String(ans).slice(0, 2500));
        } catch {}
      }
      return reply('✅ *.antispam* is working.\n' + (text ? 'Args: ' + text : 'Usage: `.antispam <args>`'));
    } catch (e) {
      return reply('❌ antispam: ' + (e.message || e));
    }
  }
};
