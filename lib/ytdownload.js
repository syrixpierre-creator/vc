/**
 * QUEEN AKUMA • YouTube download helper (local, no third-party API key needed)
 * Uses @distube/ytdl-core. Files are streamed to ./tmp and deleted after sending.
 */
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

const TMP = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

const YT_RE = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v=))|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,11})/;

const isYtUrl = (u) => YT_RE.test(u || '');

async function resolveVideo(query) {
  if (isYtUrl(query)) {
    const id = YT_RE.exec(query)[1];
    const v = await yts({ videoId: id });
    return v;
  }
  const res = await yts(query);
  return res.videos && res.videos[0];
}

function pipeToFile(stream, file) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(file);
    stream.pipe(out);
    out.on('finish', () => resolve(file));
    out.on('error', reject);
    stream.on('error', reject);
  });
}

async function download(url, kind = 'audio') {
  const ytdl = require('@distube/ytdl-core');
  const file = path.join(TMP, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${kind === 'audio' ? 'm4a' : 'mp4'}`);
  const opts = kind === 'audio'
    ? { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }
    : { filter: (f) => f.container === 'mp4' && f.hasAudio && f.hasVideo, quality: 'highest', highWaterMark: 1 << 25 };
  await pipeToFile(ytdl(url, opts), file);
  return file;
}

function safeUnlink(f) { try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {} }

module.exports = { yts, isYtUrl, resolveVideo, download, safeUnlink };
