/**
 * QUEEN AKUMA v3.4.0 — .fx image effects (Levanter #6)
 * .fx <effect> — photo par reply karo | .fx list — saare effects dekho
 */
const { applyEffect, list } = require('../lib/fxEffects');

module.exports = {
  command: 'fx', aliases: ['effect', 'photoeffect', 'sketch', 'pencil', 'cartoon', 'zombie', 'makeup', 'bokeh', 'bloody', 'horned', 'enhance', 'demon', 'wanted', 'kiss', 'look', 'color', 'dark', 'gandm'], category: 'tools',
  description: 'Photo par 17 effects lagao (Jimp, no API)',
  usage: '.fx sketch (photo par reply) | .fx list',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = (context.commandName || context.cmd || '').toLowerCase();
    const effectNames = ['sketch', 'pencil', 'cartoon', 'zombie', 'makeup', 'bokeh', 'bloody', 'horned', 'enhance', 'demon', 'wanted', 'kiss', 'look', 'color', 'dark', 'gandm'];
    const effect = effectNames.includes(invoked) ? invoked : (args[0] || '').toLowerCase();
    if (!effect || effect === 'list') {
      const lines = list().map((e, i) => `${i + 1}. *${e.name}* — ${e.desc}`).join('\n');
      return reply(`🎨 *Image Effects (17)*\n\n${lines}\n\nUse: photo par reply karke \`.fx sketch\` likho.`);
    }
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = quoted?.imageMessage || message.message?.imageMessage;
    if (!imgMsg) return reply('❌ Pehle ek photo bhejo ya photo par reply karke likho: `.fx ' + effect + '`');
    await sock.sendMessage(chatId, { text: `🎨 *${effect}* effect lag raha hai...` }, { quoted: message });
    try {
      const { downloadMediaMessage } = require('@whiskeysockets/baileys');
      const key = quoted ? { remoteJid: chatId, id: message.message.extendedTextMessage.contextInfo.stanzaId, participant: message.message.extendedTextMessage.contextInfo.participant } : message.key;
      const buf = await downloadMediaMessage({ key, message: { imageMessage: imgMsg } }, 'buffer', {}, { logger: { level: 'silent' } });
      if (buf.length > 5 * 1024 * 1024) return reply('❌ Photo 5MB se badi hai.');
      const res = await applyEffect(Buffer.from(buf), effect);
      if (!res.ok) return reply('❌ ' + res.error);
      return sock.sendMessage(chatId, { image: res.buffer, caption: `🎨 *Effect:* ${effect}` }, { quoted: message });
    } catch (e) {
      return reply('❌ Effect error: ' + String(e.message || e).slice(0, 150));
    }
  },
};
