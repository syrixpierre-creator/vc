/**
 * QUEEN AKUMA • .vv — view-once media reveal
 * Reply karke `.vv` likho (photo/video/audio), ya `.vv <number>` — unlocked
 * media us number ko bhej do.
 *
 * Tareeka (lyfe00011 gist port, 2026-11-16) — FORWARD-FIRST:
 * quoted view-once ko download kiye bina seedha forward karo (viewOnce flag
 * hata kar). Download se tez, aur tab bhi kaam karta hai jab quote me
 * directPath/url na ho. Gist jaisa seedha forward kaam NAHI karta — Baileys
 * rc14 ka generateForwardMessageContent wrapper unwrap karta hai lekin inner
 * media ka `viewOnce: true` rehne deta hai (real Baileys se verify kiya);
 * isliye pehle flag false karna zaroori hai (lib/vv2.forwardUnlocked).
 * Forward fail ho to purana download tareeka fallback hai (reuploadRequest
 * ke saath — v2.8.2 fix).
 */
const vv2 = require('../lib/vv2');

module.exports = {
  command: 'vv',
  aliases: ['viewonce', 'readviewonce'],
  category: 'tools',
  description: 'Reveal view-once media (forward-first, fast)',
  usage: '.vv (reply view-once) | .vv <number>',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
    try {
      const ctx = message.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      if (!quoted) return reply('❌ View-once media pe reply karke `.vv` likho\n\nExample:\n- reply to a view-once image, video or audio\n- `.vv 919876543210` — unlocked media us number ko bhejo');
      const vo = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message || quoted.viewOnceMessageV2Extension?.message || quoted;
      const isImage = !!vo?.imageMessage;
      const isVideo = !!vo?.videoMessage;
      const isAudio = !!vo?.audioMessage;
      if (!isImage && !isVideo && !isAudio) return reply('❌ View-once image/video nahi mila.');
      const target = {
        key: {
          remoteJid: chatId,
          id: ctx.stanzaId,
          participant: ctx.participant
        },
        message: quoted
      };
      const dest = vv2.parseTargetJid(args[0]) || chatId;
      // 1) Forward-first — download nahi, tez.
      if (await vv2.forwardUnlocked(sock, target, dest)) return;
      // 2) Download fallback — purana tareeka.
      let buf = null;
      try {
        buf = await vv2.downloadWithReupload(sock, target);
      } catch (e) {
        return reply('❌ vv error: ' + String((e && e.message) || e).slice(0, 120));
      }
      if (!buf || !buf.length) return reply('❌ Media download nahi ho paya. Dobara try karo.');
      if (isImage) {
        await sock.sendMessage(dest, { image: buf, caption: '👁️ View once unlocked' }, { quoted: message });
      } else if (isVideo) {
        await sock.sendMessage(dest, { video: buf, caption: '👁️ View once unlocked' }, { quoted: message });
      } else {
        await sock.sendMessage(dest, { audio: buf, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: message });
      }
    } catch (e) {
      return reply('❌ vv error: ' + (e.message || e));
    }
  }
};
