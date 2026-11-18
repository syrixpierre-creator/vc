const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn, getWelcome } = require('../lib/index');

async function handleJoinEvent(sock, id, participants) {
  try {
    if (!(await isWelcomeOn(id))) return;
    const custom = await getWelcome(id);
    const meta = await sock.groupMetadata(id);
    const groupName = meta.subject || 'the group';
    const desc = meta.desc || '';
    const list = (participants || []).map((p) => (typeof p === 'string' ? p : (p.id || String(p))));
    for (const jid of list) {
      const user = String(jid).split('@')[0];
      const text = (custom || 'Welcome {user} to {group}! 🎉')
        .replace(/{user}/g, '@' + user)
        .replace(/{group}/g, groupName)
        .replace(/{description}/g, desc);
      let image = null;
      try { image = await sock.profilePictureUrl(jid, 'image'); } catch (_) {}
      try {
        if (image) await sock.sendMessage(id, { image: { url: image }, caption: text, mentions: [jid] });
        else await sock.sendMessage(id, { text, mentions: [jid] });
      } catch (_) {
        await sock.sendMessage(id, { text, mentions: [jid] }).catch(() => {});
      }
    }
  } catch (e) {
    console.error('[welcome] join event error:', e.message);
  }
}

module.exports = {
  command: 'welcome',
  aliases: ['setwelcome'],
  category: 'admin',
  description: 'Configure welcome messages for new members',
  usage: '.welcome <on|off|set message>',
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    await handleWelcome(sock, chatId, message, args.join(' '));
  },
  handleJoinEvent
};
