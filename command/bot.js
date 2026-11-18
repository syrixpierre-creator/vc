/** .bot — quick bot status card */
const os = require('os');
const settings = require('../settings');

function fmtUptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return `${d ? d + 'd ' : ''}${h}h ${m}m ${sec}s`;
}

module.exports = {
  command: 'bot',
  aliases: ['botinfo', 'botstatus', 'alive'],
  category: 'general',
  description: 'Show bot status, uptime and stats',
  usage: '.bot',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    let cmds = 0;
    try { cmds = require('../lib/commandHandler').commands.size; } catch (_) {}
    const mem = process.memoryUsage();
    const prefixes = Array.isArray(settings.prefixes) ? settings.prefixes.join(' ') : '.';
    let pkg = {};
    try { pkg = require('../package.json'); } catch (_) {}
    const t0 = Date.now();
    const text =
      `🤖 *${settings.botName} is ALIVE*\n\n` +
      `👑 Owner: ${settings.botOwner || '-'}\n` +
      `🔖 Version: ${pkg.version || '-'}\n` +
      `⌨️ Prefixes: ${prefixes}\n` +
      `📦 Commands: ${cmds}\n` +
      `⏱️ Uptime: ${fmtUptime(process.uptime())}\n` +
      `🧠 RAM: ${(mem.rss / 1048576).toFixed(0)} MB (host ${(os.freemem() / 1048576).toFixed(0)} MB free)\n` +
      `🖥️ Node: ${process.version} • ${os.platform()}\n\n` +
      `_Type ${(Array.isArray(settings.prefixes) && settings.prefixes[0]) || '.'}menu for all commands_`;
    await sock.sendMessage(chatId, { text }, { quoted: message });
    void t0;
  }
};
