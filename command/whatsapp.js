 'use strict';
/**
 * QUEEN AKUMA — .onwa : check karo number WhatsApp par hai ya nahi (Baileys, no API).
 * Usage: .onwa <number> [number2 ...] (max 5)
 */
const digits = (s) => String(s || '').replace(/\D/g, '');

module.exports = {
  command: 'onwa',
  aliases: [],
  category: 'tools',
  description: 'Check if a number is on WhatsApp: .onwa <number>',
  usage: '.onwa <number> [number2 ...]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const nums = (args || []).join(' ').split(/[\s,]+/).map(digits).filter((n) => n.length >= 10).slice(0, 5);
    if (!nums.length) {
      await reply('📌 *Usage:* .onwa <number>');
      return;
    }
    if (typeof sock.onWhatsApp !== 'function') {
      await reply('❌ *This feature is not available on this connection.*');
      return;
    }
    try {
      const jids = nums.map((n) => n + '@s.whatsapp.net');
      const res = await sock.onWhatsApp(...jids);
      const rows = Array.isArray(res) ? res : [res];
      const lines = rows.map((r, i) => {
        const ok = !!(r && r.exists);
        return (ok ? '✅' : '❌') + ' +' + nums[i] + (ok ? ' — WhatsApp par hai' : ' is not on WhatsApp');
      });
      await reply('📱 *OnWa Check*\n\n' + lines.join('\n'));
    } catch (e) {
      await reply('❌ *Check failed:* ' + String(e.message || e).slice(0, 120));
    }
  },
};
