/**
 * QUEEN AKUMA • .setvv — ViewOnce auto-reveal mode for this group
 * (v3.5.0 audit-fix: pehle ye file ek bare async function export karti thi,
 *  isliye lib/compat nativeModuleFor() ise load hi nahi karta tha aur
 *  imp_setvv.js wrapper smartEngine fallback par gir jata tha — mode kabhi
 *  set hi nahi hota tha, reply me sirf AI/generic text aata tha. Ab proper
 *  QUEEN-AKUMA-shape module hai, loader ise native register karta hai.)
 *
 * .setvv public  — recovered view-once media isi group me bhejo
 * .setvv private — recovered media sirf bot ke private number (owner DM) me
 * .setvv off     — mode band
 * .setvv status  — current mode dekho
 * Sirf group me, sirf owner chala sakta hai.
 */
const settings = require('../settings.js');
const { getViewOnceMode, setViewOnceMode } = require('../lib/vv-settings.js');

function senderDigits(message, context) {
  const raw = context?.senderId || context?.sender || message.key?.participant || message.key?.remoteJid || '';
  return String(raw).replace(/\D/g, '');
}

module.exports = {
  command: 'setvv',
  aliases: [],
  category: 'tools',
  description: 'ViewOnce auto-reveal mode for this group (public/private/off)',
  usage: '.setvv public | private | off | status',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    if (!String(chatId).endsWith('@g.us')) {
      return reply('❌ *This command can only be used in groups!*');
    }
    const ownerNumber = String(settings.ownerNumber || '').replace(/\D/g, '');
    const sender = senderDigits(message, context);
    const isOwner = !!message.key.fromMe || (ownerNumber && sender.includes(ownerNumber));
    if (!isOwner) {
      return reply('❌ Sirf bot owner `.setvv` mode change kar sakta hai.');
    }

    const option = String(args[0] || '').toLowerCase();
    const current = getViewOnceMode(chatId);
    if (option === 'public' || option === 'private') {
      setViewOnceMode(chatId, option);
      const destination = option === 'public' ? 'isi group chat' : 'sirf bot ke private number';
      return reply(`✅ ViewOnce mode *${option}* set ho gaya.\nRecovered image, video ya audio ${destination} send hoga.`);
    }
    if (option === 'off') {
      setViewOnceMode(chatId, null);
      return reply('✅ ViewOnce mode off. Ab `.vv` is group mein kaam nahi karega.');
    }
    if (option === 'status' || !option) {
      return reply(`ℹ️ ViewOnce mode: *${current || 'not set'}*\nUse: \`.setvv public | private | off\``);
    }
    return reply('❌ Use: `.setvv public`, `.setvv private`, `.setvv status`, ya `.setvv off`.');
  }
};
