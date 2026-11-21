/**
 * QUEEN AKUMA • .exportsession — Session string export karo (v2.9.1)
 * Render/Railway/Heroku restart par files delete kar dete hain — isliye
 * SESSION_ID env var chahiye hota hai. Ye command wahi string deta hai.
 *
 * Usage: .exportsession   (sirf owner, sirf DM me)
 * Output: QUEEN-AKUMA~<base64 creds.json>  → SESSION_ID env me daalo.
 *
 * SECURITY: session string = WhatsApp account ka access. Sirf owner ko
 * milti hai, sirf DM me. Group me kabhi nahi bhejta. Kisi ko forward mat karo.
 */
const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

module.exports = {
  command: 'exportsession',
  aliases: ['savesession', 'sessionstring'],
  category: 'owner',
  description: 'Export session string for SESSION_ID env (deploy on other hosts)',
  usage: '.exportsession',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const senderJid = message.key.participant || message.key.remoteJid;

    // Sirf owner
    let isOwner = false;
    try {
      isOwner = isOwnerOrSudo.isOwnerOnly(senderJid) || (await isOwnerOrSudo(senderJid, sock, chatId));
    } catch (_) { isOwner = false; }
    if (message.key.fromMe) isOwner = true; // owner apne phone se bheje to sender remoteJid hota hai (dusra banda) — fromMe hi owner hai
    if (!isOwner) return reply('🚫 *You are not authorized to use this command!*');

    // Sirf DM — group me session string kabhi nahi
    if (String(chatId || '').endsWith('@g.us')) {
      return reply('🔒 *Use this command in DM.*');
    }

    const credsPath = path.join(__dirname, '..', 'session', 'creds.json');
    if (!fs.existsSync(credsPath)) {
      return reply('❌ *No session found. The bot is not paired yet.*');
    }

    let raw;
    try { raw = fs.readFileSync(credsPath, 'utf8'); JSON.parse(raw); }
    catch (_) { return reply('❌ *Session file is corrupted. Pair again.*'); }

    const sessionId = 'QUEEN-AKUMA~' + Buffer.from(raw, 'utf8').toString('base64');
    return reply(
      '🔑 *SESSION_ID*\n\n' +
      '```\n' + sessionId + '\n```\n\n' +
      '⚠️ *Secret: do not share it!*\n' +
      'Naye host par `SESSION_ID` env var me yehi string daalo.\n' +
      'Render / Railway / Heroku / Fly.io — sab par yahi chalega.'
    );
  }
};
