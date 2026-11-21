/**
 * QUEEN AKUMA • .ghsave — Session GitHub repo me save karo (v2.9.2)
 * QUEEN AKUMA ka GitHub session system — ab QUEEN AKUMA me.
 * Usage: .ghsave   (sirf owner)
 * Setup: GITHUB_TOKEN + GITHUB_REPO env var chahiye (private repo!).
 * Details: GITHUB_SESSION.md
 */
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'ghsave',
  aliases: ['githubsave', 'savesessiongh'],
  category: 'owner',
  description: 'Save WhatsApp session to GitHub repo (auto-backup)',
  usage: '.ghsave',
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
    const r = await gh.saveCurrentSession();
    if (!r.ok) return reply('❌ *Save failed:* ' + r.error);
    return reply(`✅ *Session saved to GitHub!*`);
  }
};
