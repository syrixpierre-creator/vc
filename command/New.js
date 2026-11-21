'use strict';
/**
 * QUEEN AKUMA — .history (is chat ke recent messages dikhao).
 * Pehle ye sirf stub template tha. Ab real: lightweight_store me bot ke
 * chalu rehne ke dauraan save hue recent messages (max 70/chat, SQLite
 * backend) me se aakhri N dikhata hai — sender + time + text snippet.
 * Bot restart se pehle ke messages store me nahi hote.
 */
const store = require('../lib/lightweight_store');

function msgText(m) {
  const msg = m && m.message;
  if (!msg) return '';
  return msg.conversation || (msg.extendedTextMessage && msg.extendedTextMessage.text) ||
    (msg.imageMessage && (msg.imageMessage.caption || '[photo]')) ||
    (msg.videoMessage && (msg.videoMessage.caption || '[video]')) ||
    (msg.audioMessage && '[audio]') || (msg.stickerMessage && '[sticker]') ||
    (msg.documentMessage && '[document]') || (msg.protocolMessage && '[system]') || '';
}

module.exports = {
  command: 'history',
  aliases: [],
  category: 'tools',
  description: 'Is chat ke aakhri messages dikhao (bot ke store se).',
  usage: '.history [count]',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    let n = parseInt((args || [])[0], 10);
    if (!n || n < 1) n = 10;
    if (n > 20) n = 20;
    const all = (store.messages && Array.isArray(store.messages[chatId])) ? store.messages[chatId] : [];
    const items = all.filter((m) => m && m.key && m.key.id !== message.key.id).slice(-n);
    if (!items.length) {
      await reply('📜 *Chat History*\n\nNo history saved for this chat yet.');
      return;
    }
    const lines = items.map((m) => {
      const sender = String((m.key.participant || m.key.remoteJid || '?')).split('@')[0].split(':')[0];
      const ts = m.messageTimestamp ? new Date(Number(m.messageTimestamp) * 1000).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : '';
      const text = msgText(m).replace(/\n+/g, ' ').slice(0, 90) || '[media]';
      return '• ' + (ts ? ts + ' ' : '') + '@' + sender + ': ' + text;
    });
    await reply('📜 *Chat History* (aakhri ' + items.length + ')\n\n' + lines.join('\n'));
  }
};
