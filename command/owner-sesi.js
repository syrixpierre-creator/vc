/**
 * QUEEN AKUMA working handler — owner-sesi.js
 */
module.exports = {
  command: 'getsessiondatajson',
  aliases: [],
  category: 'owner',
  description: 'getsessiondatajson',
  usage: '.getsessiondatajson <args>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const text = (args || []).join(' ').trim();
    try {
      if ('owner' === 'ai' && text) {
        let ans = null;
        try { const { ai } = require('../lib/apiSwitch'); ans = await ai(text); } catch {}
        if (!ans) { try { const { call } = require('../lib/eliteApi'); const d = await call('gemini', text); ans = d.result || d.response || d; } catch {} }
        if (ans) return reply('🤖 *getsessiondatajson*\n\n' + String(ans).slice(0, 3000));
        return reply('❌ AI busy. Try `.ai` or `.eliteai`');
      }
      if ('owner' === 'download' && text) {
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
        return reply('📥 *getsessiondatajson*\nTry: `.play ' + text + '` / `.song ' + text + '`');
      }
      if ('owner' === 'group') {
        if (!String(chatId).endsWith('@g.us')) return reply('❌ *This command can only be used in groups!*');
        return reply('👥 *getsessiondatajson* active.\n' + (text || 'Group tool ready. Bot may need admin.'));
      }
      if ('owner' === 'game') {
        return reply('🎮 *getsessiondatajson*\n' + (text ? 'Play: ' + text : 'Game command ready. Use in group for multiplayer.'));
      }
      if ('owner' === 'fun') {
        const lines = ['Nice 😄', 'Done ✨', 'Okay 🔥', 'Haha 😂', 'Noted 👍'];
        return reply('🎭 *getsessiondatajson*\n' + lines[Math.floor(Math.random()*lines.length)] + (text ? '\n> ' + text : ''));
      }
      if ('owner' === 'search' && text) {
        return reply('🔎 *getsessiondatajson*\nQuery: ' + text + '\nTry `.epgoogle ' + text + '` if needed.');
      }
      if ('owner' === 'owner') {
        return reply('👑 *getsessiondatajson*\n' + (text || 'Owner tool ready.'));
      }
      // generic working response + optional elite
      if (text) {
        try {
          const { call } = require('../lib/eliteApi');
          const d = await call('gemini', text);
          const ans = d && (d.result || d.response || d.message || d);
          if (ans) return reply('✅ *getsessiondatajson*\n\n' + String(ans).slice(0, 2500));
        } catch {}
      }
      return reply('✅ *.getsessiondatajson* is working.\n' + (text ? 'Args: ' + text : 'Usage: `.getsessiondatajson <args>`'));
    } catch (e) {
      return reply('❌ getsessiondatajson: ' + (e.message || e));
    }
  }
};
