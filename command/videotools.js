'use strict';
/**
 * QUEEN AKUMA v3.5.0 — Video Tools Batch (QUEEN AKUMA + raganork ports).
 * .mp4reverse .slowmo .x2mp4 .x4mp4 .mp4image .mp3crusher .avmix .vmix .interp .rotate
 * Sirf ffmpeg, no API. Video pe reply karke chalao.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const mediaDl = require('../lib/mediaDl');
const { getMedia, writeTmp, cleanup, ffmpeg } = mediaDl;

const MAX_VIDEO = 60 * 1024 * 1024; // 60MB cap

function reply(sock, message, text) {
  return sock.sendMessage(message.key.remoteJid, { text }, { quoted: message });
}
function stateDir(chatId) {
  const dir = path.join(os.tmpdir(), 'demon-avmix', String(chatId).replace(/[^A-Za-z0-9]/g, '_'));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
async function runVideo(sock, message, filterArgs, outExt, caption) {
  const chatId = message.key.remoteJid;
  const media = await getMedia(message, ['video']);
  if (!media) {
    await reply(sock, message, '📌 *Usage:* reply to a video');
    return;
  }
  if (media.buffer.length > MAX_VIDEO) {
    await reply(sock, message, '❌ *Video is too big (over 60MB).*');
    return;
  }
  const inPath = writeTmp(media.buffer, 'mp4');
  const outPath = inPath + '.out.' + outExt;
  await reply(sock, message, '⏳ Processing video...');
  try {
    await ffmpeg(['-y', '-i', inPath].concat(filterArgs).concat([outPath]), 180000);
    const out = fs.readFileSync(outPath);
    await sock.sendMessage(chatId, { video: out, caption: caption || '' }, { quoted: message });
  } catch (e) {
    await reply(sock, message, '❌ *Video processing failed:* ' + String(e.message || e).slice(0, 150));
  } finally {
    cleanup(inPath, outPath);
  }
}

async function handleAvmixSaved(sock, message, args, context) {
  // Two-step completion: is message me jo media hai, wo saved dusre hisse se merge hoga.
  const chatId = message.key.remoteJid;
  const dir = stateDir(chatId);
  const audioPath = path.join(dir, 'audio.mp3');
  const videoPath = path.join(dir, 'video.mp4');
  const m = (await getMedia(message, ['video', 'audio'])) || null;
  if (!m) {
    await reply(sock, message, '📌 *Usage:* reply to an audio with .avmix, then reply to a video with .avmix');
    return;
  }
  if (m.kind === 'audio' && fs.existsSync(videoPath)) {
    const vIn = videoPath;
    const aIn = writeTmp(m.buffer, 'mp3');
    const outPath = vIn + '.avmix.mp4';
    await reply(sock, message, '⏳ Merging audio + video...');
    try {
      await ffmpeg(['-y', '-i', vIn, '-i', aIn, '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath], 120000);
      await sock.sendMessage(chatId, { video: fs.readFileSync(outPath) }, { quoted: message });
      cleanup(audioPath, videoPath);
    } catch (e) {
      await reply(sock, message, '❌ *Merge failed:* ' + String(e.message || e).slice(0, 150));
    } finally { cleanup(aIn, outPath); }
    return;
  }
  if (m.kind === 'video' && fs.existsSync(audioPath)) {
    const aIn = audioPath;
    const vIn = writeTmp(m.buffer, 'mp4');
    const outPath = vIn + '.avmix.mp4';
    await reply(sock, message, '⏳ Merging audio + video...');
    try {
      await ffmpeg(['-y', '-i', vIn, '-i', aIn, '-c:v', 'copy', '-c:a', 'aac', '-shortest', outPath], 120000);
      await sock.sendMessage(chatId, { video: fs.readFileSync(outPath) }, { quoted: message });
      cleanup(audioPath, videoPath);
    } catch (e) {
      await reply(sock, message, '❌ *Merge failed:* ' + String(e.message || e).slice(0, 150));
    } finally { cleanup(vIn, outPath); }
    return;
  }
  // Kuch bhi saved nahi — save kar lo
  if (m.kind === 'audio') {
    fs.writeFileSync(audioPath, m.buffer);
    await reply(sock, message, '✅ *Audio saved.* Now reply to a video with .avmix');
  } else {
    fs.writeFileSync(videoPath, m.buffer);
    await reply(sock, message, '✅ *Video saved.* Now reply to an audio with .avmix');
  }
}

async function handleVmix(sock, message, args, context) {
  const chatId = message.key.remoteJid;
  const dir = stateDir(chatId);
  const v1Path = path.join(dir, 'video1.mp4');
  const v2Path = path.join(dir, 'video2.mp4');
  const m = await getMedia(message, ['video']);
  if (!m) {
    await reply(sock, message, '📌 *Usage:* reply to a video with .vmix, then reply to another video with .vmix');
    return;
  }
  if (!fs.existsSync(v1Path)) {
    fs.writeFileSync(v1Path, m.buffer);
    await reply(sock, message, '✅ *Video 1 saved.* Now reply to the second video with .vmix');
    return;
  }
  fs.writeFileSync(v2Path, m.buffer);
  const outPath = path.join(dir, 'merged.mp4');
  await reply(sock, message, '⏳ Merging videos...');
  try {
    await ffmpeg(['-y', '-i', v1Path, '-i', v2Path, '-filter_complex',
      '[0:v]scale=640:-2,fps=30,format=yuv420p[v0];[1:v]scale=640:-2,fps=30,format=yuv420p[v1];[v0][v1]concat=n=2:v=1:a=0[outv]',
      '-map', '[outv]', '-c:v', 'libx264', '-r', '30', outPath], 180000);
    await sock.sendMessage(chatId, { video: fs.readFileSync(outPath) }, { quoted: message });
    cleanup(v1Path, v2Path);
  } catch (e) {
    await reply(sock, message, '❌ *Merge failed:* ' + String(e.message || e).slice(0, 150));
  } finally { cleanup(outPath); }
}

async function handleMp3crusher(sock, message, args, context) {
  const chatId = message.key.remoteJid;
  const media = await getMedia(message, ['audio', 'video']);
  if (!media) {
    await reply(sock, message, '📌 *Usage:* reply to an audio/video with .mp3crusher');
    return;
  }
  const inPath = writeTmp(media.buffer, media.kind === 'video' ? 'mp4' : 'mp3');
  const outPath = inPath + '.crushed.mp3';
  await reply(sock, message, '⏳ Crushing audio...');
  try {
    await ffmpeg(['-y', '-i', inPath, '-af', 'acrusher=0.1:1:64:0:log,aresample=8000', '-c:a', 'libmp3lame', '-b:a', '64k', outPath], 120000);
    await sock.sendMessage(chatId, { audio: fs.readFileSync(outPath), mimetype: 'audio/mpeg' }, { quoted: message });
  } catch (e) {
    await reply(sock, message, '❌ *Crush failed:* ' + String(e.message || e).slice(0, 150));
  } finally { cleanup(inPath, outPath); }
}

module.exports = {
  commands: [
    {
      command: 'mp4reverse', aliases: ['reversevideo', 'videoreverse'],
      description: 'Video + audio ulta (reverse) chalao.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        await runVideo(sock, message, ['-vf', 'reverse', '-af', 'areverse', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'], 'mp4', '🔁 Reversed video');
      }
    },
    {
      command: 'slowmo', aliases: ['slowmotion', 'slowvideo'],
      description: 'Video 2x slow motion banao.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        await runVideo(sock, message, ['-filter:v', 'setpts=2.0*PTS', '-filter:a', 'atempo=0.5', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'], 'mp4', '🐢 Slow motion video');
      }
    },
    {
      command: 'x2mp4', aliases: ['shrinkvideo', 'compressvideo'],
      description: 'Video size aadha (50%) karo.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        await runVideo(sock, message, ['-vf', 'scale=iw/2:ih/2', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'], 'mp4', '📦 Half-size video');
      }
    },
    {
      command: 'x4mp4', aliases: ['tinyvideo'],
      description: 'Video size 25% karo.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        await runVideo(sock, message, ['-vf', 'scale=iw/4:ih/4', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'], 'mp4', '📦 Quarter-size video');
      }
    },
    {
      command: 'mp4image', aliases: ['phototovideo', 'imgtovideo'],
      description: 'Make a 5 second video from a photo.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const chatId = message.key.remoteJid;
        const media = await getMedia(message, ['image']);
        if (!media) {
          await reply(sock, message, '📌 *Usage:* reply to a photo with .mp4image');
          return;
        }
        const inPath = writeTmp(media.buffer, 'jpg');
        const outPath = inPath + '.vid.mp4';
        await reply(sock, message, '⏳ Making video from photo...');
        try {
          await ffmpeg(['-y', '-loop', '1', '-t', '5', '-i', inPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', outPath], 120000);
          await sock.sendMessage(chatId, { video: fs.readFileSync(outPath), caption: '🖼️ Photo se video' }, { quoted: message });
        } catch (e) {
          await reply(sock, message, '❌ Video nahi ban paya: ' + String(e.message || e).slice(0, 150));
        } finally { cleanup(inPath, outPath); }
      }
    },
    {
      command: 'mp3crusher', aliases: ['crushaudio', 'bitcrush'],
      description: 'Make audio lo-fi crushed (8-bit style).',
      category: 'media',
      handler: handleMp3crusher
    },
    {
      command: 'avmix', aliases: ['audiovideomix', 'mergeav'],
      description: 'Merge audio + video (two steps: audio first, then video).',
      category: 'media',
      handler: handleAvmixSaved
    },
    {
      command: 'vmix', aliases: ['mergevideo', 'joinvideo'],
      description: 'Do videos ko ek me jodo (two-step).',
      category: 'media',
      handler: handleVmix
    },
    {
      command: 'interp', aliases: ['fps60', 'smoothvideo'],
      description: 'Make a video 60fps smooth (motion interpolation).',
      category: 'media',
      handler: async (sock, message, args, context) => {
        await runVideo(sock, message, ['-vf', 'minterpolate=fps=60:mi_mode=mci', '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'], 'mp4', '✨ 60fps smooth video');
      }
    },
    {
      command: 'rotate', aliases: ['rotatevideo', 'flipvideo'],
      description: 'Video ghumao: .rotate 90 / 180 / 270.',
      category: 'media',
      handler: async (sock, message, args, context) => {
        const deg = String((args && args[0]) || '90').trim();
        let vf = 'transpose=1';
        if (deg === '180') vf = 'hflip,vflip';
        else if (deg === '270') vf = 'transpose=2';
        await runVideo(sock, message, ['-vf', vf, '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p'], 'mp4', '🔄 Rotated ' + deg + '°');
      }
    }
  ]
};
