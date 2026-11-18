/**
 * QUEEN AKUMA v3.5.0 • #13 .glock / .gunlock — group-info editing lock/unlock (raganork se)
 * .glock — sirf admins group info (name/desc) edit kar sakte hain
 * .gunlock — sab edit kar sakte hain
 */
module.exports = {
  command: 'glock',
  aliases: ['gunlock'],
  category: 'group',
  description: 'Lock/unlock group info editing (only admins can edit when locked)',
  usage: '.glock | .gunlock',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    const invoked = String((context.rawText || message.body || '').replace(/^\./, '').split(/\s+/)[0] || 'glock').toLowerCase();
    try {
      if (invoked === 'gunlock') {
        await sock.groupSettingUpdate(chatId, 'unlocked');
        return reply('🔓 Group info unlock ho gayi — ab sab members name/description edit kar sakte hain.');
      }
      await sock.groupSettingUpdate(chatId, 'locked');
      return reply('🔒 Group info lock ho gayi — ab sirf admins name/description edit kar sakte hain.');
    } catch (e) {
      return reply('❌ Setting update nahi ho payi: ' + (e.message || e));
    }
  },
};
