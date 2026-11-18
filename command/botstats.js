/*****************************************************************************
 * QUEEN AKUMA — .botstats / .stats
 *****************************************************************************/
const commandHandler = require('../lib/commandHandler');
const settings = require('../settings');
const os = require('os');

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

module.exports = {
  command: 'botstats',
  aliases: ['stats', 'botstat', 'statusbot'],
  category: 'main',
  description: 'Bot statistics — commands, memory, uptime',
  usage: '.botstats',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const mem = process.memoryUsage();
    const cmds = commandHandler.commands ? commandHandler.commands.size : 0;
    let top = [];
    try {
      if (commandHandler.stats) {
        top = [...commandHandler.stats.entries()]
          .map(([k, v]) => ({ k, calls: v.calls || 0, err: v.errors || 0, avg: v.avgMs || 0 }))
          .sort((a, b) => b.calls - a.calls)
          .slice(0, 8);
      }
    } catch (_) {}
    let text =
      ` 📊 *BOT STATS* \n\n` +
      `🤖 Bot: *${settings.botName || 'QUEEN AKUMA'}*\n` +
      `📦 Version: *${settings.version || '1.0.0'}*\n` +
      `⏱️ Uptime: *${fmt(process.uptime() * 1000)}*\n` +
      `📚 Commands loaded: *${cmds}*\n` +
      `💾 RSS: *${(mem.rss / 1048576).toFixed(1)} MB*\n` +
      `🧠 Heap: *${(mem.heapUsed / 1048576).toFixed(1)} / ${(mem.heapTotal / 1048576).toFixed(1)} MB*\n` +
      `🖥️ Free RAM: *${(os.freemem() / 1048576).toFixed(0)} / ${(os.totalmem() / 1048576).toFixed(0)} MB*\n` +
      `⚙️ Node: *${process.version}*\n` +
      `📂 Platform: *${os.platform()}*\n`;
    if (top.length) {
      text += `\n*Top commands:*\n`;
      top.forEach((t, i) => {
        text += `${i + 1}. \`.${t.k}\` — ${t.calls} calls` + (t.err ? ` (${t.err} err)` : '') + `\n`;
      });
    }
    text += `\n`;
    return sock.sendMessage(chatId, { text }, { quoted: message });
  }
};
