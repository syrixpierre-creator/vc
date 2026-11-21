const settings = require('../settings');
const { addSudo, removeSudo, getSudoList, clearAllSudo } = require('../lib/index');
const isOwnerOrSudo = require('../lib/isOwner');
const { cleanJid } = require('../lib/isOwner');

function extractTargetJid(message, args) {
  if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
    return message.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  if (message.message?.extendedTextMessage?.contextInfo?.participant) {
    return message.message.extendedTextMessage.contextInfo.participant;
  }
  const text = args.join(' ');
  const match = text.match(/\b(\d{7,15})\b/);
  if (match) return match[1] + '@s.whatsapp.net';
  return null;
}

module.exports = {
  command: 'sudo',
  aliases: ['sudolist'],
  category: 'owner',
  description: 'Add/remove/list sudo users',
  usage: '.sudo add|del|list <@user|number>',
  strictOwnerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderJid = message.key.participant || message.key.remoteJid;

    const isOwner =
      message.key.fromMe ||
      isOwnerOrSudo.isOwnerOnly(senderJid) ||
      (await isOwnerOrSudo(senderJid, sock, chatId));

    const sub = (args[0] || '').toLowerCase();

    // list works for owner (and shows clearly)
    if (sub === 'list' || sub === 'ls') {
      if (!isOwner) {
        return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*: `.sudo list`' }, { quoted: message });
      }
      let list = [];
      try {
        list = await getSudoList();
      } catch (e) {
        return sock.sendMessage(chatId, { text: '❌ Sudo list read error: ' + e.message }, { quoted: message });
      }
      if (!Array.isArray(list) || list.length === 0) {
        return sock.sendMessage(
          chatId,
          {
            text:
              '❌ *Sudo list is empty.*\n📌 *Usage:* .sudo add @user'
          },
          { quoted: message }
        );
      }
      const textList = list
        .map((j, i) => {
          const id = String(j).replace(/@.*$/, '');
          return ` ${i + 1}. @${id}`;
        })
        .join('\n');
      return sock.sendMessage(
        chatId,
        {
          text: ` *SUDO USERS* \n\n${textList}\n\n\nTotal: *${list.length}*`,
          mentions: list.map((j) => (String(j).includes('@') ? j : j + '@s.whatsapp.net'))
        },
        { quoted: message }
      );
    }

    // v2.8.8: .sudo clear — saare sudo numbers ek saath hatao
    if (sub === 'clear' || sub === 'clearall' || sub === 'delall') {
      if (!isOwner) {
        return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
      }
      const count = await clearAllSudo();
      return sock.sendMessage(
        chatId,
        { text: count > 0 ? `✅ *${count} sudo number(s) removed.*` : '❌ *Sudo list is already empty.*' },
        { quoted: message }
      );
    }

    if (!sub || !['add', 'del', 'remove', 'rm'].includes(sub)) {
      return sock.sendMessage(
        chatId,
        {
          text:
            '📌 *Usage:* .sudo add|del|list|clear <@user|number>\n\n'
        },
        { quoted: message }
      );
    }

    if (!isOwner) {
      return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
    }

    const target = extractTargetJid(message, args.slice(1));
    if (!target) {
      return sock.sendMessage(
        chatId,
        { text: '❌ Tag user, reply, ya number do.\nExample: `.sudo add 9198xxxxxxxx`' },
        { quoted: message }
      );
    }

    if (sub === 'add') {
      await addSudo(target);
      return sock.sendMessage(
        chatId,
        { text: `✅ Sudo *added*\n\`${cleanJid(target) || target}\``, mentions: [target] },
        { quoted: message }
      );
    }

    if (sub === 'del' || sub === 'remove' || sub === 'rm') {
      // v2.8.8: removeSudo ab sach batata hai (true = hata diya, false = list me tha hi nahi)
      const removed = await removeSudo(target);
      return sock.sendMessage(
        chatId,
        { text: removed ? `✅ Sudo *removed*\n\`${cleanJid(target) || target}\`` : `❌ *Number not in the sudo list:* ${cleanJid(target) || target}` },
        { quoted: message }
      );
    }
  }
};
