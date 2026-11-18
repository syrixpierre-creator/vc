/**
 * QUEEN AKUMA • StickerMaker (used by the sticker command).
 * Was `module.exports = {}` so every call crashed. Implemented on top of
 * the real helpers that already exist: lib/sticker, lib/uploadImage, ffmpeg.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const settings = require('../settings');

function ffmpegBin() {
  try { return require('@ffmpeg-installer/ffmpeg').path; } catch { return 'ffmpeg'; }
}

async function fetchGif(url) {
  const r = await fetch(String(url), { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('GIF download failed: HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}

function runFfmpeg(args, inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegBin(), ['-y', '-i', inputPath, ...args, outputPath]);
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg exited with code ' + code))));
  });
}

function tmpFile(ext) {
  const dir = path.join(process.cwd(), 'temp');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'sm-' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.' + ext);
}

async function videoToWebp(media) {
  const inp = tmpFile('mp4'), out = tmpFile('webp');
  fs.writeFileSync(inp, media);
  try {
    await runFfmpeg(['-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15', '-vcodec', 'libwebp', '-lossless', '0', '-compression_level', '6', '-q:v', '50', '-loop', '0', '-preset', 'picture', '-an', '-vsync', '0'], inp, out);
    return fs.readFileSync(out);
  } finally {
    for (const f of [inp, out]) { try { fs.unlinkSync(f); } catch {} }
  }
}

async function gifToSticker(gifBuffer) {
  const { sticker } = require('./sticker');
  return sticker(gifBuffer, null, settings.packname || 'QUEEN AKUMA', settings.author || 'INCONNU BOY SENSEI');
}

async function convertStickerToImage(stickerBuffer) {
  const inp = tmpFile('webp'), out = tmpFile('png');
  fs.writeFileSync(inp, stickerBuffer);
  try {
    await runFfmpeg([], inp, out);
    return fs.readFileSync(out);
  } finally {
    for (const f of [inp, out]) { try { fs.unlinkSync(f); } catch {} }
  }
}

module.exports = { videoToWebp, fetchGif, gifToSticker, convertStickerToImage };
module.exports.default = module.exports;
