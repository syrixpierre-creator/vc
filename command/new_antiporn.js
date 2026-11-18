/**
 * QUEEN AKUMA — .antiporn (native, v3.6.3)
 * Pehle ye legacy anti-porn.js ka wrapper tha (Sightengine paid API + cmd()
 * system jo is bot me hai hi nahi) — "cmd is not a function" error deta tha.
 * Ab native hai: adult-domain links ko group me delete karta hai (bina key).
 * Image/video classification ke liye Sightengine keys chahiye — wo is version
 * me nahi hai, status me saaf likha hai.
 */
const { isOn, setOn, onMessage } = require('../lib/antiporn');

module.exports = {
  command: 'antiporn',
  aliases: ['antipornwarn', 'antinudity', 'pornblock', 'nsfwblock'],
  category: 'group',
  description: 'Block adult links in group (no API key needed)',
  usage: '.antiporn on|off|status',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      await sock.sendMessage(chatId, { text: '❌ *This command can only be used in groups!*' }, { quoted: message });
      return;
    }
    const arg = String((args && args[0]) || '').toLowerCase().trim();
    // SET — owner/group-admin only (v3.6.0 ownerAdmin pattern)
    if (arg === 'on' || arg === 'off') {
      const allowed = await require('../lib/ownerAdmin').canToggle(sock, message, context);
      if (!allowed) {
        await sock.sendMessage(chatId, { text: '❌ *Only group admins or the bot owner can use this command.*' }, { quoted: message });
        return;
      }
      setOn(chatId, arg === 'on');
      await sock.sendMessage(chatId, { text: arg === 'on'
        ? '🔞 *Anti-Porn ON*\n\nAdult links (porn sites) group me auto delete honge.\nNote: sirf LINKS block hote hain — image/video detection ke liye Sightengine API keys chahiye, jo set nahi hain.'
        : '🔞 *Anti-Porn OFF*\n\nAdult link protection band kar diya.' }, { quoted: message });
      return;
    }
    // status (sab dekh sakte hain)
    const on = isOn(chatId);
    await sock.sendMessage(chatId, { text: `🔞 *ANTI PORN PROTECTION*\n📊 Status: ${on ? '✅ ON' : '❌ OFF'}\n\n• Adult-domain links auto delete hote hain (bina API key)\n• Image/video detection: NOT SET (Sightengine keys chahiye)\n\nUse: \`.antiporn on\` / \`.antiporn off\`` }, { quoted: message });
  },
  async onMessage(sock, message, ctx) { return onMessage(sock, message, ctx); },
};
