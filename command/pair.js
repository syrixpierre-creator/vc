'use strict';
/**
 * QUEEN AKUMA — .pair <number>
 * Gets the pairing code from this server and sends ONLY the code (easy to copy),
 * with a copy button.
 */
const { requestPairCode } = require('../lib/botNetwork');

async function sendCode(sock, chatId, code, quoted) {
  try {
    const { sendButtons } = require('gifted-btns');
    await sendButtons(sock, chatId, {
      text: code,
      buttons: [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: '📋 Copy code', copy_code: code }) }],
    });
    return;
  } catch (_) {}
  await sock.sendMessage(chatId, { text: code, __noSite: true }, { quoted });
}

module.exports = {
  command: 'pair',
  aliases: [],
  category: 'general',
  description: 'Get a pairing code for a new bot',
  usage: '.pair <number>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const sender = String(message.key.participant || message.key.remoteJid || '').split('@')[0].split(':')[0];
    const number = ((args || []).join('') || (chatId.endsWith('@g.us') ? '' : sender)).replace(/[^0-9]/g, '');
    if (number.length < 10 || number.length > 15) return reply('📌 *Usage:* .pair 554488138425');

    try { await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } }); } catch (_) {}
    const r = await requestPairCode(number);
    if (r.ok && r.code) {
      try { await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } }); } catch (_) {}
      return sendCode(sock, chatId, r.code, message);
    }
    try { await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } }); } catch (_) {}
    const why = {
      'invalid-number': '❌ *Invalid number!*',
      timeout: '❌ *No code received. Try again.*',
      'not-managed': '❌ *Pairing is not available on this bot.*',
    };
    return reply(why[r.error] || `❌ *${r.error || 'Pairing failed.'}*`);
  },
};
