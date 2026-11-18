/**
 * QUEEN AKUMA — Set Status (Levanter style)
 * .setstatus <text>
 * .setstatus (reply to image/video) <caption>
 * Sets WhatsApp status (story) of the bot account.
 */
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'setstatus',
  aliases: ['status', 'setstory', 'updatestatus'],
  category: 'owner',
  description: 'Set WhatsApp status / story of the bot',
  usage: '.setstatus Hello world  |  reply to media + .setstatus caption',
  ownerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const text = args.join(' ').trim();
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });

    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const m = message.message || {};

      // Media status
      let mediaMsg = null;
      let type = null;

      if (quoted?.imageMessage) { mediaMsg = quoted.imageMessage; type = 'image'; }
      else if (quoted?.videoMessage) { mediaMsg = quoted.videoMessage; type = 'video'; }
      else if (m.imageMessage) { mediaMsg = m.imageMessage; type = 'image'; }
      else if (m.videoMessage) { mediaMsg = m.videoMessage; type = 'video'; }

      if (mediaMsg) {
        const stream = await downloadContentFromMessage(mediaMsg, type);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buffer = Buffer.concat(chunks);

        const tmp = path.join(__dirname, '../temp');
        if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
        const ext = type === 'image' ? 'jpg' : 'mp4';
        const file = path.join(tmp, `status_${Date.now()}.${ext}`);
        fs.writeFileSync(file, buffer);

        await sock.sendMessage('status@broadcast', {
          [type]: { url: file },
          caption: text || mediaMsg.caption || ''
        });

        try { fs.unlinkSync(file); } catch {}
        return reply('✅ Status (media) set successfully!');
      }

      // Text status
      if (!text) {
        return reply('❌ Usage:\n• `.setstatus Your status text`\n• Reply to image/video + `.setstatus caption`');
      }

      await sock.sendMessage('status@broadcast', { text });
      return reply('✅ Text status set:\n' + text);
    } catch (e) {
      console.error('[setstatus]', e);
      return reply('❌ Failed to set status: ' + (e.message || e));
    }
  }
};
