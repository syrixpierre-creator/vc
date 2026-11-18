/**
 * QUEEN AKUMA • user info commands: .jid .lid .profile .me .id .whois
 * Pehle ye sirf foreign-framework wrappers (lg_/bandah) me the; ab native hain.
 */
const settings = require('../settings');

function jidInfo(sock, message) {
  const chatId = message.key.remoteJid;
  const sender = message.key.participant || message.key.remoteJid;
  const pushName = message.pushName || '';
  return { chatId, sender, pushName, isGroup: String(chatId).endsWith('@g.us'), bot: sock?.user?.id || '' };
}

async function send(sock, message, text) {
  await sock.sendMessage(message.key.remoteJid, { text }, { quoted: message });
}

function make(cmd, aliases, desc, usage, fn) {
  return { command: cmd, aliases, category: 'general', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const info = jidInfo(sock, message);
      await send(sock, message, fn(info, args));
    } };
}

const jidCmd = make('jid', ['getjid', 'channeljid'], 'Show JIDs of this chat and sender', '.jid',
  (i) => `🪪 *JID Info*\n\n• Chat: \`${i.chatId}\`\n• Sender: \`${i.sender}\`\n• Bot: \`${i.bot}\`${i.pushName ? '\n• Name: ' + i.pushName : ''}`);
const lidCmd = make('lid', ['getlid'], 'Show LID / sender id', '.lid',
  (i) => `🪪 *LID*\n\n• Sender: \`${i.sender}\`${i.pushName ? '\n• Name: ' + i.pushName : ''}\n• Chat: \`${i.chatId}\``);
const profileCmd = make('profile', ['whois', 'me', 'info'], 'Show your profile / IDs', '.profile',
  (i) => `👤 *Profile*\n\n• Name: ${i.pushName || '-'}\n• JID: \`${i.sender}\`\n• Number: ${String(i.sender).split('@')[0]}\n• Chat: \`${i.chatId}\`\n• Group: ${i.isGroup ? 'Yes' : 'No'}\n• Bot: ${settings.botName}`);
const idCmd = make('id', ['chatid'], 'Show current chat id', '.id', (i) => `🆔 Chat ID: \`${i.chatId}\``);

module.exports = { commands: [jidCmd, lidCmd, profileCmd, idCmd] };
