'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .edit (raganork port).
 * Bot ka apna message edit karo. Bot ke message pe reply karke chalao.
 * Baileys edit: sendMessage({ text, edit: key }) — key = quoted message ka.
 * (.hack wahi pattern use karta hai: edit: sent.key)
 */
module.exports = {
  command: 'edit',
  aliases: ['editmsg'],
  description: 'Bot ke apne message ko edit karo (uspe reply karke).',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const newText = (args || []).join(' ').trim();
    if (!newText) {
      await reply('❌ Naya text do.\nUsage: bot ke message pe reply karke *.edit naya text* likho.');
      return;
    }
    const ci = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo;
    if (!ci || !ci.stanzaId) {
      await reply('❌ Pehle bot ke kisi message pe reply karo, phir *.edit <naya text>* chalao.');
      return;
    }
    const botId = (sock.user && sock.user.id ? String(sock.user.id).split(':')[0] : '');
    const quotedFromBot = !botId || String(ci.participant || '').startsWith(botId) || ci.participant === botId + '@s.whatsapp.net';
    const key = { id: ci.stanzaId, remoteJid: chatId, fromMe: true };
    try {
      await sock.sendMessage(chatId, { text: newText, edit: key }, { quoted: message });
    } catch (e) {
      await reply('❌ Edit nahi ho paya: ' + String(e.message || e).slice(0, 120) +
        (quotedFromBot ? '' : '\nNote: sirf bot ke apne message edit ho sakte hain.'));
    }
  }
};
