/**
 * QUEEN AKUMA • gif helpers used by reactions / fun commands.
 * fetchGif(url) downloads a gif URL to a Buffer (or searches Giphy by text).
 * gifToVideo(buffer) converts a gif Buffer to an mp4 Buffer via ffmpeg.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function ffmpegBin() {
  try { return require('@ffmpeg-installer/ffmpeg').path; } catch { return 'ffmpeg'; }
}

async function fetchGif(input) {
  if (Buffer.isBuffer(input)) return input;
  const s = String(input || '').trim();
  if (!s) throw new Error('No gif URL or search text given');
  if (/^https?:\/\//i.test(s)) {
    const r = await fetch(s, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!r.ok) throw new Error('GIF download failed: HTTP ' + r.status);
    return Buffer.from(await r.arrayBuffer());
  }
  // search text -> Giphy (public beta key if no GIPHY_KEY set)
  const key = process.env.GIPHY_KEY || 'dc6zaTOxFJmzC';
  const r = await fetch('https://api.giphy.com/v1/gifs/search?api_key=' + key + '&q=' + encodeURIComponent(s) + '&limit=1&rating=pg');
  const j = await r.json();
  const url = j && j.data && j.data[0] && j.data[0].images && j.data[0].images.original && j.data[0].images.original.url;
  if (!url) throw new Error('No GIF found for: ' + s);
  return fetchGif(url);
}

async function gifToVideo(gifBuffer) {
  const dir = path.join(process.cwd(), 'temp');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = Date.now() + '-' + Math.floor(Math.random() * 1e6);
  const inp = path.join(dir, 'gif-' + stamp + '.gif');
  const out = path.join(dir, 'gif-' + stamp + '.mp4');
  fs.writeFileSync(inp, gifBuffer);
  try {
    await new Promise((resolve, reject) => {
      const ff = spawn(ffmpegBin(), ['-y', '-i', inp, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', out]);
      ff.on('error', reject);
      ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg exited with code ' + code))));
    });
    return fs.readFileSync(out);
  } finally {
    for (const f of [inp, out]) { try { fs.unlinkSync(f); } catch {} }
  }
}

module.exports = { fetchGif, gifToVideo };
