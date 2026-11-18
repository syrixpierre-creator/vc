/**
 * QUEEN AKUMA v3.5.0 • GAAJU .setnewsletter — channel JID resolve karo invite code se
 * Usage: .setnewsletter <invite_code> (wa.me/channel/XXXXXX wala code)
 * Owner-only. JID data/newsletter.json me save hota hai (.env me nahi likha jata).
 */
const fs = require('fs');
const path = require('path');
const STORE = path.join(__dirname, '..', 'data', 'newsletter.json');

module.exports = {
  command: 'setnewsletter',
  aliases: ['setnews', 'newsid'],
  category: 'owner',
  description: 'Resolve a WhatsApp Channel JID from its invite code and save it',
  usage: '.setnewsletter <invite_code>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!context.isOwnerOrSudoCheck) return reply('🚫 *You are not authorized to use this command!*');
    const code = (args[0] || '').trim();
    if (!code) {
      return reply('📢 *Set Newsletter*\n\nUsage: `.setnewsletter <invite_code>`\n\nInvite code channel share link se milega — jaise wa.me/channel/XXXXXX me XXXX wala part.');
    }
    try {
      const info = await sock.newsletterMetadata('invite', code);
      if (!info || !info.id) return reply('❌ Channel JID resolve nahi ho paya. Pehle bot account se channel follow karo.');
      try {
        fs.mkdirSync(path.dirname(STORE), { recursive: true });
        fs.writeFileSync(STORE, JSON.stringify({ jid: info.id, name: info.name || '', code, savedAt: Date.now() }, null, 2));
      } catch (_) {}
      return reply(`✅ *Channel JID resolved and saved!*\n\n📢 *Name:* ${info.name || 'Unknown'}\n🆔 *JID:* \`${info.id}\``);
    } catch (e) {
      return reply('❌ Error: ' + (e.message || e) + '\n\nPehle bot se channel follow karo, phir try karo.');
    }
  },
};
