/**
 * QUEEN AKUMA • .ghrestore — Session GitHub repo se wapas lao (v2.9.2)
 * QUEEN AKUMA ka GitHub session system — ab QUEEN AKUMA me.
 * Usage: .ghrestore   (sirf owner)
 * Restore ke baad bot RESTART karo — phir session se connect hoga.
 * Setup: GITHUB_TOKEN + GITHUB_REPO env var chahiye (private repo!).
 * Details: GITHUB_SESSION.md
 */
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'ghrestore',
  aliases: ['githubrestore', 'restoresessiongh'],
  category: 'owner',
  description: 'Restore WhatsApp session from GitHub repo',
  usage: '.ghrestore',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const senderJid = message.key.participant || message.key.remoteJid;
    let isOwner = false;
    try {
      isOwner = isOwnerOrSudo.isOwnerOnly(senderJid) || (await isOwnerOrSudo(senderJid, sock, chatId));
    } catch (_) { isOwner = false; }
    if (message.key.fromMe) isOwner = true; // owner apne phone se bheje to sender remoteJid hota hai — fromMe hi owner hai
    if (!isOwner) return reply('🚫 *You are not authorized to use this command!*');

    const gh = require('../lib/githubSession');
    if (!gh.isConfigured()) {
      return reply('❌ *GitHub session is not set.* Set GITHUB_TOKEN and GITHUB_REPO in .env.');
    }
    const r = await gh.restoreSessionToLocal();
    if (!r.ok) return reply('❌ *Restore failed:* ' + r.error);
    return reply(`✅ *Session restored from GitHub!*\nRestart the bot.`);
  }
};
