/** .tog <command> — enable/disable a command at runtime (owner only) */
module.exports = {
  command: 'tog',
  aliases: ['togglecmd', 'disablecmd'],
  category: 'owner',
  description: 'Enable or disable a command (toggle)',
  usage: '.tog <command>   (run again to enable)',
  ownerOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const name = (args[0] || '').toLowerCase().replace(/^[^a-z0-9]+/, '');
    if (!name) return reply('Usage: `.tog <command>`');
    const ch = require('../lib/commandHandler');
    if (name === 'tog') return reply('❌ You cannot disable the tog command.');
    const exists = ch.commands.has(name) || ch.aliases.has(name);
    if (!exists) return reply(`❌ Command *${name}* not found.`);
    const key = ch.commands.has(name) ? name : ch.aliases.get(name);
    const state = ch.toggleCommand(key);
    return reply(`🔧 Command *${key}* is now *${state}*.`);
  }
};
