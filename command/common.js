/**
 * QUEEN AKUMA — Common members between groups (Levanter style)
 * .common <groupjid2>   or reply with group invite / jid
 * Shows members who are in both current group and the other group.
 */
module.exports = {
  command: 'common',
  aliases: ['commonmembers', 'same'],
  category: 'group',
  description: 'Find common members between two groups',
  usage: '.common <other-group-jid>   or  .common (reply to group link/jid)',
  groupOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    let otherJid = args[0]?.trim();
    if (!otherJid) {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const qText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
      const match = qText.match(/(\d+@g\.us)/) || qText.match(/(https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)/);
      if (match) otherJid = match[1];
    }

    if (!otherJid) {
      return reply('❌ Dusre group ka JID do.\nExample: `.common 120363xxxxx@g.us`\nYa group invite link / jid wale message pe reply karke `.common`');
    }

    if (!otherJid.endsWith('@g.us')) {
      // try to resolve invite code if link
      if (otherJid.includes('chat.whatsapp.com')) {
        try {
          const code = otherJid.split('/').pop().split('?')[0];
          const info = await sock.groupGetInviteInfo(code);
          otherJid = info.id;
        } catch {
          return reply('❌ *Group not found from invite link, or the bot is not in that group.*');
        }
      } else {
        return reply('❌ Valid group JID chahiye (xxxx@g.us)');
      }
    }

    try {
      const meta1 = await sock.groupMetadata(chatId);
      const meta2 = await sock.groupMetadata(otherJid);

      const set1 = new Set(meta1.participants.map(p => p.id));
      const common = meta2.participants.filter(p => set1.has(p.id));

      if (!common.length) {
        return reply(`❌ *No common members between ${meta1.subject} and ${meta2.subject}.*`);
      }

      let msg = `👥 *Common Members*\n\n`;
      msg += `Group 1: *${meta1.subject}*\n`;
      msg += `Group 2: *${meta2.subject}*\n`;
      msg += `Common: *${common.length}*\n\n`;

      const mentions = [];
      common.slice(0, 30).forEach((p, i) => {
        msg += `${i + 1}. @${p.id.split('@')[0]}\n`;
        mentions.push(p.id);
      });
      if (common.length > 30) msg += `\n... +${common.length - 30} more`;

      await sock.sendMessage(chatId, { text: msg, mentions }, { quoted: message });
    } catch (e) {
      console.error('[common]', e);
      return reply('❌ *Error:* the bot must be in both groups.\n' + e.message);
    }
  }
};
