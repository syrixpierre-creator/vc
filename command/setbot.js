/*****************************************************************************
 * QUEEN AKUMA — customise bot name / menu photo / menu video
 * .setbotname | .setbotimage | .setbotvideo | .setbot
 *****************************************************************************/
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const botProfile = require('../lib/botProfile');
const isOwner = require('../lib/isOwner');
const { uploadToCatbox, downloadUrl } = require('../lib/uploadMedia');

async function ownerOk(message, sock, chatId) {
  if (message.key.fromMe) return true;
  const s = message.key.participant || message.key.remoteJid;
  try {
    if (isOwner.isOwnerOnly && isOwner.isOwnerOnly(s)) return true;
  } catch (_) {}
  return !!(await isOwner(s, sock, chatId));
}

function extractUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s]+/i);
  return m ? m[0] : '';
}

function getQuotedOrSelf(message) {
  return (
    message.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    message.message?.imageMessage ||
    message.message?.videoMessage ||
    null
  );
}

async function mediaFromMessage(sock, message) {
  // direct image/video on this message
  if (message.message?.imageMessage || message.message?.videoMessage) {
    const buf = await downloadMediaMessage(message, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });
    const isVid = !!message.message?.videoMessage;
    return { buffer: buf, isVideo: isVid };
  }
  // quoted
  const ctx = message.message?.extendedTextMessage?.contextInfo;
  if (ctx?.quotedMessage) {
    const qm = {
      key: {
        remoteJid: message.key.remoteJid,
        id: ctx.stanzaId,
        fromMe: false,
        participant: ctx.participant
      },
      message: ctx.quotedMessage
    };
    if (ctx.quotedMessage.imageMessage || ctx.quotedMessage.videoMessage) {
      const buf = await downloadMediaMessage(qm, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });
      return { buffer: buf, isVideo: !!ctx.quotedMessage.videoMessage };
    }
  }
  return null;
}

async function resolveMediaLink(sock, message, argsText) {
  const url = extractUrl(argsText);
  if (url) {
    // if already a direct link, use as-is (no reupload required)
    if (/\.(jpg|jpeg|png|webp|gif|mp4|webm)(\?|$)/i.test(url) || /catbox\.moe|imgur|i\.ibb/i.test(url)) {
      return { url, from: 'link' };
    }
    // try download + rehost
    try {
      const buf = await downloadUrl(url);
      const isVideo = /\.mp4|video/i.test(url);
      const link = await uploadToCatbox(buf, isVideo ? 'menu.mp4' : 'menu.jpg');
      return { url: link, from: 'link-rehost' };
    } catch {
      return { url, from: 'link-direct' };
    }
  }
  const media = await mediaFromMessage(sock, message);
  if (media && media.buffer) {
    const link = await uploadToCatbox(
      media.buffer,
      media.isVideo ? 'bot-menu.mp4' : 'bot-menu.jpg'
    );
    return { url: link, from: media.isVideo ? 'video' : 'image', isVideo: media.isVideo };
  }
  return null;
}

module.exports = {
  command: 'setbot',
  aliases: ['botset', 'setprofile'],
  category: 'owner',
  description: 'Customise bot name / menu photo / video',
  usage: '.setbot name|image|video|status',
  strictOwnerOnly: true,

  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!(await ownerOk(message, sock, chatId))) {
      return sock.sendMessage(chatId, { text: '🚫 *You are not authorized to use this command!*' }, { quoted: message });
    }

    const sub = String(args[0] || '').toLowerCase();
    const rest = args.slice(1).join(' ').trim();

    if (!sub || sub === 'status' || sub === 'show') {
      const p = botProfile.get();
      return sock.sendMessage(
        chatId,
        {
          text:
            ` 🤖 *BOT PROFILE* \n\n` +
            `*Name:* ${p.botName}\n` +
            `*Owner label:* ${p.botOwner || '—'}\n` +
            `*Menu image:*\n${p.menuImage || '_default_'}\n\n` +
            `*Menu video:*\n${p.menuVideo || '_default_'}\n\n` +
            `*Commands:*\n` +
            `• \`.setbotname QUEEN AKUMA\`\n` +
            `• \`.setbotimage <link>\` / photo attach / reply\n` +
            `• \`.setbotvideo <link>\` / video attach / reply\n` +
            `• \`.setbot owner INCONNU BOY SENSEI\`\n` +
            `\n`
        },
        { quoted: message }
      );
    }

    if (sub === 'name') {
      if (!rest) return sock.sendMessage(chatId, { text: 'Usage: `.setbot name MY-BOT`' }, { quoted: message });
      botProfile.setField('botName', rest);
      return sock.sendMessage(chatId, { text: `✅ Bot name: *${rest}*` }, { quoted: message });
    }

    if (sub === 'owner') {
      if (!rest) return sock.sendMessage(chatId, { text: 'Usage: `.setbot owner Your Name`' }, { quoted: message });
      botProfile.setField('botOwner', rest);
      return sock.sendMessage(chatId, { text: `✅ Owner label: *${rest}*` }, { quoted: message });
    }

    if (sub === 'image' || sub === 'photo' || sub === 'img' || sub === 'pp') {
      await sock.sendMessage(chatId, { text: '⏳ Image set ho rahi…' }, { quoted: message }).catch(() => {});
      try {
        const resolved = await resolveMediaLink(sock, message, rest);
        if (!resolved) {
          return sock.sendMessage(
            chatId,
            {
              text:
                '❌ Photo / link chahiye.\n\n' +
                '• Photo bhejo + caption \`.setbot image\`\n' +
                '• Photo pe reply \`.setbot image\`\n' +
                '• \`.setbot image https://...\`'
            },
            { quoted: message }
          );
        }
        botProfile.setField('menuImage', resolved.url);
        try { require('../lib/mediaCache').clearMediaCache(); } catch {} // v2.4.0: purana cached menu media hatao
        return sock.sendMessage(
          chatId,
          {
            image: { url: resolved.url },
            caption: `✅ *Menu image* set!\n\`${resolved.url}\`\n_Source: ${resolved.from}_`
          },
          { quoted: message }
        );
      } catch (e) {
        return sock.sendMessage(chatId, { text: '❌ ' + e.message }, { quoted: message });
      }
    }

    if (sub === 'video' || sub === 'vid') {
      await sock.sendMessage(chatId, { text: '⏳ Video set ho rahi…' }, { quoted: message }).catch(() => {});
      try {
        const resolved = await resolveMediaLink(sock, message, rest);
        if (!resolved) {
          return sock.sendMessage(
            chatId,
            {
              text:
                '❌ Video / link chahiye.\n\n' +
                '• Video bhejo + caption \`.setbot video\`\n' +
                '• Video pe reply \`.setbot video\`\n' +
                '• \`.setbot video https://...mp4\`'
            },
            { quoted: message }
          );
        }
        botProfile.setField('menuVideo', resolved.url);
        return sock.sendMessage(
          chatId,
          {
            video: { url: resolved.url },
            mimetype: 'video/mp4',
            caption: `✅ *Menu video* set!\n\`${resolved.url}\`\n_Source: ${resolved.from}_`
          },
          { quoted: message }
        );
      } catch (e) {
        return sock.sendMessage(chatId, { text: '❌ ' + e.message }, { quoted: message });
      }
    }

    return sock.sendMessage(
      chatId,
      { text: 'Usage: `.setbot status|name|image|video|owner`' },
      { quoted: message }
    );
  }
};
