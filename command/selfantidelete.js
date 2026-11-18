/*****************************************************************************
 * QUEEN AKUMA — Self / DM Anti-Delete
 *****************************************************************************/
const anti = require('./antidelete');

module.exports = {
  command: 'selfantidelete',
  aliases: ['selfdelete', 'dmantidelete', 'antidm', 'pmantidelete', 'antideleteself', 'antiselfdelete'],
  category: 'owner',
  description: 'Anti-delete for personal/DM chats',
  usage: '.selfantidelete on|off',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const cfg = anti.getConfig();
    const action = (args[0] || '').toLowerCase();

    if (!action || action === 'status') {
      return sock.sendMessage(chatId, { text: anti.statusText() }, { quoted: message });
    }
    if (action === 'own') {
      const v = (args[1] || '').toLowerCase();
      if (!['on', 'off'].includes(v)) return sock.sendMessage(chatId, { text: `ℹ️ Own-message recovery: *${cfg.own ? 'ON' : 'OFF'}*\nUsage: .selfantidelete own on|off` }, { quoted: message });
      anti.saveConfig({ ...cfg, own: v === 'on' });
      return sock.sendMessage(chatId, { text: `✅ Own-message recovery *${v.toUpperCase()}*` }, { quoted: message });
    }
    if (action === 'on' || action === 'true' || action === '1') {
      anti.saveConfig({ ...cfg, self: true });
      const check = anti.getConfig();
      return sock.sendMessage(
        chatId,
        {
          text:
            `✅ *Self/DM Anti-Delete ON*\n\n` +
            `Config: self=*${check.self}*\n` +
            `Ab DM me message delete hone par bot tumhare apne chat (Message yourself) me recover karega.\n\n` +
            `_Note: Delete se pehle message bot ko receive hona chahiye._`
        },
        { quoted: message }
      );
    }

    if (action === 'off' || action === 'false' || action === '0') {
      anti.saveConfig({ ...cfg, self: false });
      return sock.sendMessage(chatId, { text: '❌ *Self/DM Anti-Delete OFF*' }, { quoted: message });
    }

    return sock.sendMessage(chatId, { text: 'Usage: `.selfantidelete on` / `.selfantidelete off`' }, { quoted: message });
  }
};
