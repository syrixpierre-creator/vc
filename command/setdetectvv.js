/**
 * QUEEN AKUMA • .setdetectvv — Auto ViewOnce detect ON/OFF (per chat)
 * (v3.5.0 audit-fix: pehle ye smartEngine smartRun('setdetectvv') par
 *  jata tha, jisme is command ki koi branch hi nahi hai — generic AI
 *  fallback reply aata tha aur mode kabhi set nahi hota tha. Ab proper
 *  QUEEN-AKUMA-shape module hai, lib/vv-settings se seedha mode set karta hai.)
 *
 * .setdetectvv on      — is chat me view-once media aate hi owner DM me forward
 * .setdetectvv private — same as on (owner DM)
 * .setdetectvv off     — band
 * .setdetectvv status  — current mode dekho
 * Sirf owner chala sakta hai (dusron ka view-once media forward hota hai).
 */
const settings = require('../settings.js');
const { getAutoDetectMode, setAutoDetectMode } = require('../lib/vv-settings.js');

function senderDigits(message, context) {
  const raw = context?.senderId || context?.sender || message.key?.participant || message.key?.remoteJid || '';
  return String(raw).replace(/\D/g, '');
}

module.exports = {
  command: 'setdetectvv',
  aliases: ['autovv', 'detectvv'],
  category: 'owner',
  description: 'Auto ViewOnce detect: view-once media aate hi owner DM me forward',
  usage: '.setdetectvv on | private | off | status',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    const ownerNumber = String(settings.ownerNumber || '').replace(/\D/g, '');
    const sender = senderDigits(message, context);
    const isOwner = !!message.key.fromMe || (ownerNumber && sender.includes(ownerNumber));
    if (!isOwner) {
      return reply('🚫 *You are not authorized to use this command!*');
    }

    const option = String(args[0] || '').toLowerCase();
    const current = getAutoDetectMode(chatId);
    if (option === 'on' || option === 'private') {
      setAutoDetectMode(chatId, option);
      return reply(
        `✅ *Auto ViewOnce detect ${option.toUpperCase()}*\n\n` +
        `Ab is chat me view-once photo/video/audio aate hi download hokar owner DM me forward ho jayega.\n\n` +
        ``
      );
    }
    if (option === 'off') {
      setAutoDetectMode(chatId, null);
      return reply('✅ *Auto ViewOnce detect DISABLED*');
    }
    if (option === 'status' || !option) {
      return reply(
        `ℹ️ *Auto ViewOnce detect:* ${current ? `*${current.toUpperCase()}*` : '❌ OFF'}\n\n` +
        `Available options:\n- on\n- off`
      );
    }
    return reply('❌ Use: `.setdetectvv on`, `.setdetectvv private`, `.setdetectvv off`, ya `.setdetectvv status`.');
  }
};
