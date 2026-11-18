/**
 * QUEEN AKUMA • .eval — owner-only JavaScript runner.
 * Pehle sirf foreign-framework owner2.js me tha; ab native QUEEN AKUMA command hai.
 * Sirf owner/sudo chala sakta hai. Output 3000 chars tak, usse zyada file me.
 */
const vm = require('vm');
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'eval',
  aliases: ['ev', 'exec', 'shell', 'runjs'],
  category: 'owner',
  description: 'Owner only: run JavaScript code',
  usage: '.eval <js code>',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    let allowed = message.key.fromMe;
    if (!allowed) { try { allowed = await isOwnerOrSudo(senderId, sock, chatId); } catch {} }
    if (!allowed) return reply('🚫 *You are not authorized to use this command!* command.');
    const code = (args || []).join(' ').trim()
      || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
      || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || '';
    if (!code) return reply('❌ Usage: .eval <js code>\nExample: .eval 1 + 1');
    try {
      const out = await vm.runInNewContext('(async () => { ' + code + ' })()', { sock, message, args, console, require, process, Buffer, setTimeout }, { timeout: 8000 });
      let text = typeof out === 'string' ? out : JSON.stringify(out, null, 2);
      if (text === undefined) text = 'undefined';
      if (text.length > 3000) {
        await sock.sendMessage(chatId, { document: Buffer.from(text), mimetype: 'text/plain', fileName: 'eval-output.txt', caption: '📄 Eval output (too long for chat)' }, { quoted: message });
        return;
      }
      await reply('✅ *Eval result:*\n```\n' + text + '\n```');
    } catch (e) {
      await reply('❌ *Eval error:*\n' + String((e && e.message) || e).slice(0, 1500));
    }
  }
};
