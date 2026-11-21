 'use strict';
/**
 * QUEEN AKUMA — .wastalk : kisi number ki WhatsApp profile dekho — DP + about + registered ya nahi.
 * Baileys sock methods, no API key. Usage: .wastalk <number>
 */
const digits = (s) => String(s || '').replace(/\D/g, '');

module.exports = {
  command: 'wastalk',
  aliases: [],
  category: 'tools',
  description: 'WhatsApp profile stalk: .wastalk <number>',
  usage: '.wastalk <number>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
    let num = digits((args || [])[0] || '');
    if (!num && ctxInfo.mentionedJid && ctxInfo.mentionedJid[0]) num = digits(ctxInfo.mentionedJid[0]);
    if (!num && ctxInfo.participant) num = digits(ctxInfo.participant);
    if (!num || num.length < 10) {
      await reply('📌 *Usage:* .wastalk <number>');
      return;
    }
    const jid = num + '@s.whatsapp.net';
    let exists = null;
    try {
      if (typeof sock.onWhatsApp !== 'function') { await reply('❌ *This feature is not available on this connection.*'); return; }
      const res = await sock.onWhatsApp(jid);
      const row = Array.isArray(res) ? res[0] : res;
      exists = !!(row && row.exists);
    } catch (e) { exists = null; }
    let pp = null;
    try { pp = await sock.profilePictureUrl(jid, 'image'); } catch (e) { pp = null; }
    let about = null;
    try {
      const st = await sock.fetchStatus(jid);
      about = st && st.status ? String(st.status) : null;
    } catch (e) { about = null; }
    const lines = [
      '🔍 *WhatsApp Stalk*',
      '',
      '📱 Number: +' + num,
      '✅ WhatsApp par: ' + (exists === null ? 'pata nahi chala' : (exists ? 'Haan' : 'Nahi')),
      '💬 About: ' + (about || '—'),
      '🖼️ Profile pic: ' + (pp ? 'Hai' : 'Nahi / private'),
    ];
    if (pp) {
      try {
        await sock.sendMessage(chatId, { image: { url: pp }, caption: lines.join('\n') }, { quoted: message });
        return;
      } catch (e) { /* fall through to text */ }
    }
    await reply(lines.join('\n'));
  },
};
