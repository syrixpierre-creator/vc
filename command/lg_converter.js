'use strict';
/**
 * QUEEN AKUMA — converter (st/tovideo/tomp3/...).
 * .tovideo: quoted sticker/gif/image → video (ffmpeg, local).
 * .tomp3: quoted video/audio → mp3 (ffmpeg, local).
 * Baaki aliases (toimg/toaudio/toptt/tovoice/...) purane compat run se chalte
 * hain — unhe chheda nahi gaya. (converter.js khud stub hai, isliye tovideo
 * aur tomp3 compat/smartRun fallback me girte the — ab real hain.)
 */
const { run } = require('../lib/compat');
const META = {"file":"converter.js","family":"B","command":"st","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};
const mediaDl = require('../lib/mediaDl');
const { getMedia, ffmpeg, writeTmp, cleanup } = mediaDl;

const MAX_MB = 60;

function invokedName(message, context) {
  const t = String((context && (context.rawText || context.userMessage)) || message.body || message.message?.conversation || (message.message?.extendedTextMessage?.text) || '');
  return t.replace(/^\./, '').split(/\s+/)[0].toLowerCase();
}

async function tovideo(sock, message, args, context) {
  const chatId = context.chatId || message.key.remoteJid;
  const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
  const media = await getMedia(message, ['sticker', 'video', 'image']);
  if (!media) {
    await reply('❌ Sticker, GIF ya video pe reply karke *.tovideo* chalao.\nExample: sticker pe reply → .tovideo');
    return;
  }
  if (media.buffer.length > MAX_MB * 1024 * 1024) {
    await reply('❌ File bahut badi hai (60MB tak allowed).');
    return;
  }
  const inExt = media.kind === 'sticker' ? 'webp' : media.kind === 'video' ? 'mp4' : 'jpg';
  const inPath = writeTmp(media.buffer, inExt);
  const outPath = inPath + '.mp4';
  try {
    if (media.kind === 'video') {
      await ffmpeg(['-y', '-i', inPath, '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', outPath], 120000);
      const fs = require('fs');
      await sock.sendMessage(chatId, { video: fs.readFileSync(outPath), caption: '🎬 *Video*\nConverted by QUEEN AKUMA', gifPlayback: false }, { quoted: message });
    } else {
      // sticker / static image → 3s looping video
      let ok = false;
      try {
        await ffmpeg(['-y', '-i', inPath, '-vf', 'scale=640:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath], 120000);
        ok = true;
      } catch (e) { ok = false; }
      if (!ok) {
        await ffmpeg(['-y', '-loop', '1', '-t', '3', '-i', inPath, '-vf', 'scale=640:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath], 120000);
      }
      const fs = require('fs');
      await sock.sendMessage(chatId, { video: fs.readFileSync(outPath), caption: '🎬 *Video*\nSticker → Video • QUEEN AKUMA', gifPlayback: true }, { quoted: message });
    }
  } catch (e) {
    await reply('❌ Video convert nahi ho paya: ' + String(e.message || e).slice(0, 120));
  } finally {
    cleanup(inPath, outPath);
  }
}

async function tomp3(sock, message, args, context) {
  const chatId = context.chatId || message.key.remoteJid;
  const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
  const media = await getMedia(message, ['video', 'audio']);
  if (!media) {
    await reply('❌ Video ya audio pe reply karke *.tomp3* chalao.\nExample: video pe reply → .tomp3');
    return;
  }
  if (media.buffer.length > MAX_MB * 1024 * 1024) {
    await reply('❌ File bahut badi hai (60MB tak allowed).');
    return;
  }
  const inExt = media.kind === 'video' ? 'mp4' : 'ogg';
  const inPath = writeTmp(media.buffer, inExt);
  const outPath = inPath + '.mp3';
  try {
    await ffmpeg(['-y', '-i', inPath, '-vn', '-c:a', 'libmp3lame', '-q:a', '4', outPath], 120000);
    const fs = require('fs');
    await sock.sendMessage(chatId, { audio: fs.readFileSync(outPath), mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: message });
  } catch (e) {
    await reply('❌ MP3 convert nahi ho paya: ' + String(e.message || e).slice(0, 120));
  } finally {
    cleanup(inPath, outPath);
  }
}

module.exports = {
  command: "st",
  aliases: ["toimg","toaudio","tomp3","toptt","tovoice","tovn","tovoicenote","tovideo","tomp4","tovid","toblackscreen","blackscreen"],
  category: "converter",
  description: "Convert image/video/sticker to sticker.",
  usage: "",
  handler: async (sock, message, args, ctx) => {
    const name = invokedName(message, ctx);
    if (name === 'tovideo' || name === 'tomp4' || name === 'tovid') return tovideo(sock, message, args, ctx);
    if (name === 'tomp3' || name === 'toaudio') return tomp3(sock, message, args, ctx);
    return run(META, sock, message, args, ctx);
  }
};
