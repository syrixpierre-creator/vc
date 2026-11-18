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
  description: 'Number WhatsApp par hai ya nahi: .onwa <number>',
  usage: '.onwa <number> [number2 ...]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const nums = (args || []).join(' ').split(/[\s,]+/).map(digits).filter((n) => n.length >= 10).slice(0, 5);
    if (!nums.length) {
      await reply('📱 *OnWa*\n\nUsage: `.onwa 919876543210`\nEk ya zyada numbers check kar sakte ho (max 5).');
      return;
    }
    if (typeof sock.onWhatsApp !== 'function') {
      await reply('❌ Ye feature is connection par available nahi hai.');
      return;
    }
    try {
      const jids = nums.map((n) => n + '@s.whatsapp.net');
      const res = await sock.onWhatsApp(...jids);
      const rows = Array.isArray(res) ? res : [res];
      const lines = rows.map((r, i) => {
        const ok = !!(r && r.exists);
        return (ok ? '✅' : '❌') + ' +' + nums[i] + (ok ? ' — WhatsApp par hai' : ' — WhatsApp par nahi hai');
      });
      await reply('📱 *OnWa Check*\n\n' + lines.join('\n'));
    } catch (e) {
      await reply('❌ Check nahi ho paya: ' + String(e.message || e).slice(0, 120));
    }
  },
};
