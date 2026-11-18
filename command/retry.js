'use strict';
/**
 * QUEEN AKUMA v3.5.0 — .retry (raganork port).
 * Replied command ko dobara chalao. Quoted message me .command hona chahiye.
 * lib/cmdLookup se owning file dhoondhta hai, sirf wahi file require karta hai.
 */
const { loadEntry } = require('../lib/cmdLookup');

module.exports = {
  command: 'retry',
  aliases: ['rerun', 'again'],
  description: 'Replied command dobara chalao.',
  category: 'tools',
  handler: async (sock, message, args, context) => {
    const chatId = message.key.remoteJid;
    const reply = (text) => sock.sendMessage(chatId, { text }, { quoted: message });
    const ci = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo;
    const qm = ci && ci.quotedMessage;
    if (!qm) {
      await reply('❌ Pehle kisi command wale message pe reply karo, phir *.retry* chalao.');
      return;
    }
    const qText = qm.conversation || (qm.extendedTextMessage && qm.extendedTextMessage.text) || '';
    if (!qText.trim().startsWith('.')) {
      await reply('❌ Quoted message me koi command nahi hai (command . se shuru hona chahiye).');
      return;
    }
    const parts = qText.trim().slice(1).split(/\s+/);
    const name = (parts[0] || '').toLowerCase();
    const qArgs = parts.slice(1);
    const loaded = loadEntry(name);
    if (!loaded || !loaded.found) {
      await reply('❌ Command nahi mila: *.' + name + '*');
      return;
    }
    if (loaded.error || !loaded.entry || typeof loaded.entry.handler !== 'function') {
      await reply('❌ Command load nahi ho paya: *.' + name + '* — ' + String(loaded.error || 'no handler').slice(0, 100));
      return;
    }
    // Synthetic message — jaise user ne command abhi bheja ho
    const fakeMsg = {
      key: { remoteJid: chatId, participant: message.key.participant || context.senderId, fromMe: false, id: 'retry-' + Date.now() },
      message: { conversation: qText },
      pushName: message.pushName || 'User',
      messageTimestamp: Date.now()
    };
    const fakeCtx = Object.assign({}, context, {
      rawText: qText, messageText: qText,
      userMessage: qText, chatId, senderId: message.key.participant || context.senderId
    });
    try {
      await loaded.entry.handler(sock, fakeMsg, qArgs, fakeCtx);
    } catch (e) {
      await reply('❌ Retry fail ho gaya: *.' + name + '* — ' + String(e.message || e).slice(0, 150));
    }
  }
};
