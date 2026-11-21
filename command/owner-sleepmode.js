/**
 * QUEEN AKUMA v3.6.0 — .sleepmode on|off|status (REAL implementation)
 * Sleep me bot non-owner ke commands ka jawab nahi deta — dispatcher gate
 * lib/messageHandler.js handleMessages me hai (command dispatch se pehle).
 * on/off sirf owner/admin (lib/ownerAdmin.canToggle — menutheme jaisa
 * in-handler check); status public. State: lib/sleepMode.js
 * (data/sleepmode.json {enabled, since, by}).
 *
 * NOTE: 'sleepmode' naam pehle isi file me ek stub ke paas tha jo sirf
 * "✅ .sleepmode is working" reply karta tha — ab real hai. 'sleep' alias
 * NAHI hai (wo new_lurk.js ka alias hai).
 */
const sleepMode = require('../lib/sleepMode');
const { canToggle } = require('../lib/ownerAdmin');

module.exports = {
  command: 'sleepmode',
  aliases: [],
  category: 'owner',
  description: 'Put the bot to sleep — only owner/admin can toggle',
  usage: '.sleepmode on|off|status',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const sub = (args[0] || '').toLowerCase();

    if (!sub || sub === 'status') {
      const st = sleepMode.getState();
      if (st.enabled) {
        const when = st.since ? new Date(st.since).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) : '-';
        return reply(`✅ *Sleep mode: ON*\nSince: ${when}${st.by ? `\nBy: ${st.by}` : ''}`);
      }
      return reply('✅ *Sleep mode: OFF*');
    }

    if (sub === 'on' || sub === '1' || sub === 'true') {
      if (!(await canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
      const by = context.senderId || message.key.participant || message.key.remoteJid;
      sleepMode.setState(true, by);
      return reply('✅ *Sleep mode ENABLED*');
    }

    if (sub === 'off' || sub === '0' || sub === 'false') {
      if (!(await canToggle(sock, message, context))) return reply('❌ *Only group admins or the bot owner can use this command.*');
      sleepMode.setState(false);
      return reply('✅ *Sleep mode DISABLED*');
    }

    return reply('Usage: `.sleepmode on` / `.sleepmode off` / `.sleepmode status`');
  }
};
