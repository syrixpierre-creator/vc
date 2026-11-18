/**
 * QUEEN AKUMA v3.5.0 • #8 Chat-type gates (bot-md enable.mjs se)
 * .pconly on/off — bot sirf DM me kaam karega
 * .gconly on/off — bot sirf groups me kaam karega
 * .swonly on/off — bot sirf status par kaam karega (group/DM band)
 * .nyimak on/off — lurk mode: bot padhta hai, jawab nahi deta
 * .restrict on/off — group me sirf admins bot commands chala sakte hain
 * Owner-only. Enforcement: lib/chatgates.shouldBlock() → messageHandler.
 */
const gates = require('../lib/chatgates');

const INFO = {
  pconly: 'PC only — bot sirf DM (private chat) me kaam karega, groups me band.',
  gconly: 'GC only — bot sirf groups me kaam karega, DM me band.',
  swonly: 'SW only — bot sirf status par kaam karega, group/DM band.',
  nyimak: 'Lurk mode — bot messages padhta hai par koi jawab nahi deta.',
  restrict: 'Restrict — group me sirf admins bot commands chala sakte hain.',
};

module.exports = {
  command: 'pconly',
  aliases: ['gconly', 'swonly', 'nyimak', 'restrict'],
  category: 'owner',
  description: 'Chat-type gates — pconly/gconly/swonly/nyimak/restrict on/off',
  usage: '.pconly on|off | .gconly on|off | .swonly on|off | .nyimak on|off | .restrict on|off',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    if (!context.isOwnerOrSudoCheck) return reply('🚫 *You are not authorized to use this command!*');
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'pconly').toLowerCase();
    const sub = String(args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(sub)) {
      const g = gates.get();
      const status = Object.keys(INFO).map((k) => `• ${k}: ${g[k] ? '✅ ON' : '❌ OFF'}`).join('\n');
      return reply(`🚪 *Chat Gates*\n\n${status}\n\n*${invoked}:* ${INFO[invoked]}\n\nUsage: \`.${invoked} on\` ya \`.${invoked} off\``);
    }
    gates.set(invoked, sub === 'on');
    return reply(`🚪 *${invoked}* ${sub === 'on' ? '✅ ON' : '❌ OFF'}\n\n${INFO[invoked]}`);
  },
};
