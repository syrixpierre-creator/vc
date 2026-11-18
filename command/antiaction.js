const groupAnti = require('../lib/groupAnti');
module.exports = {
  command: 'antiaction',
  aliases: ['antiact'],
  category: 'group',
  description: 'Set anti action: delete|warn|kick',
  usage: '.antiaction <type> delete|warn|kick',
  groupOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const type = (args[0] || '').toLowerCase();
    const act = (args[1] || '').toLowerCase();
    if (!type || !['delete','warn','kick'].includes(act)) {
      return reply('Usage: `.antiaction antilink delete`\nActions: delete | warn | kick\nTypes: ' + groupAnti.ANTI_KEYS.join(', '));
    }
    if (!groupAnti.ANTI_KEYS.includes(type)) return reply('❌ Unknown type. See `.antisystem`');
    groupAnti.setAction(type, act);
    return reply(`✅ *${type}* action = *${act}*`);
  }
};
