/*****************************************************************************
 * QUEEN AKUMA — .pluginstatus
 *****************************************************************************/
const fs = require('fs');
const path = require('path');
const commandHandler = require('../lib/commandHandler');

module.exports = {
  command: 'pluginstatus',
  aliases: ['plugins', 'pluginlist', 'cmdsloaded'],
  category: 'owner',
  description: 'Plugin / command load status',
  usage: '.pluginstatus',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const dir = path.join(__dirname);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));
    const loaded = commandHandler.commands ? commandHandler.commands.size : 0;
    const disabled = commandHandler.disabledCommands ? commandHandler.disabledCommands.size : 0;
    const q = (args[0] || '').toLowerCase();
    let extra = '';
    if (q) {
      const hit = commandHandler.commands?.get(q) || (commandHandler.aliases && commandHandler.aliases.get(q));
      if (hit) {
        const cmd = typeof hit === 'string' ? commandHandler.commands.get(hit) : hit;
        extra = `\n\n*Found:* \`.${cmd.command}\`\nCategory: ${cmd.category || '—'}\nDesc: ${cmd.description || '—'}`;
      } else extra = `\n\n❌ \`.${q}\` is not loaded.`;
    }
    const text =
      ` 🔌 *PLUGIN STATUS* \n\n` +
      `📁 Plugin files: *${files.length}*\n` +
      `✅ Commands loaded: *${loaded}*\n` +
      `🚫 Disabled: *${disabled}*\n` +
      `\nSearch: \`.pluginstatus <cmd>\`` +
      extra +
      `\n\n`;
    return sock.sendMessage(chatId, { text }, { quoted: message });
  }
};
