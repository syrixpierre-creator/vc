/**
 * .epapi — list all EliteProTech API commands
 */
module.exports = {
  command: 'epapi',
  aliases: ['eliteapi', 'eliteapis', 'ephelp'],
  category: 'eliteapi',
  description: 'List EliteProTech API commands',
  usage: '.epapi',

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const { listByCategory, BASE, ENDPOINTS } = require('../lib/eliteApi');
    const cats = listByCategory();
    let msg = ` *EliteProTech APIs* ⊷\n Base: ${BASE}\n Total: ${Object.keys(ENDPOINTS).length}\n⊷\n\n`;
    for (const [cat, list] of Object.entries(cats)) {
      msg += `*${cat.toUpperCase()}*\n`;
      msg += list.map((n) => `• .ep${n}`).join('\n') + '\n\n';
    }
    msg += `_Example: .epgemini hello_\n_Dashboard: https://eliteprotech-apis.zone.id/dashboard_`;
    await sock.sendMessage(chatId, { text: msg }, { quoted: message });
  }
};
