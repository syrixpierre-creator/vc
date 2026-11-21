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
  description: 'Edit a bot message (reply to it).',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const newText = (args || []).join(' ').trim();
    if (!newText) {
      await reply('📌 *Usage:* reply to a bot message with .edit <new text>');
      return;
    }
    const ci = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo;
    if (!ci || !ci.stanzaId) {
      await reply('📌 *Usage:* reply to a bot message with .edit <new text>');
      return;
    }
    const botId = (sock.user && sock.user.id ? String(sock.user.id).split(':')[0] : '');
    const quotedFromBot = !botId || String(ci.participant || '').startsWith(botId) || ci.participant === botId + '@s.whatsapp.net';
    const key = { id: ci.stanzaId, remoteJid: chatId, fromMe: true };
    try {
      await sock.sendMessage(chatId, { text: newText, edit: key }, { quoted: message });
    } catch (e) {
      await reply('❌ *Edit failed:* ' + String(e.message || e).slice(0, 120) +
        (quotedFromBot ? '' : '\nOnly bot messages can be edited.'));
    }
  }
};
