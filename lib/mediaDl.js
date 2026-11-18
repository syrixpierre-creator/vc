'use strict';
/**
 * QUEEN AKUMA v3.5.0 — shared media download / ffmpeg helpers (Batch B).
 * Used by videotools, memegen, quotely, bgm, round, dehaze.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function quotedMsg(message) {
  return (message && message.message && message.message.extendedTextMessage &&
    message.message.extendedTextMessage.contextInfo &&
    message.message.extendedTextMessage.contextInfo.quotedMessage) || null;
}
function quotedSender(message) {
  const ci = message && message.message && message.message.extendedTextMessage &&
    message.message.extendedTextMessage.contextInfo;
  return (ci && ci.participant) || null;
}
function mentionedJids(message) {
  const ci = message && message.message && message.message.extendedTextMessage &&
    message.message.extendedTextMessage.contextInfo;
  return (ci && ci.mentionedJid) || [];
}
// Pick media from a message object (the .message part, or a quotedMessage).
function pickMedia(msg) {
  if (!msg) return null;
  if (msg.imageMessage) return { kind: 'image', content: msg.imageMessage, dl: 'image' };
  if (msg.videoMessage) return { kind: 'video', content: msg.videoMessage, dl: 'video' };
  if (msg.audioMessage) return { kind: 'audio', content: msg.audioMessage, dl: 'audio' };
  if (msg.stickerMessage) return { kind: 'sticker', content: msg.stickerMessage, dl: 'sticker' };
  if (msg.documentMessage) {
    const mt = msg.documentMessage.mimetype || '';
    let kind = null;
    if (mt.indexOf('image/') === 0) kind = 'image';
    else if (mt.indexOf('video/') === 0) kind = 'video';
    else if (mt.indexOf('audio/') === 0) kind = 'audio';
    else return null;
    return { kind, content: msg.documentMessage, dl: 'document' };
  }
  return null;
}
function quotedMedia(message) {
  const q = quotedMsg(message);
  return q ? pickMedia(q) : null;
}
function ownMedia(message) {
  return pickMedia(message && message.message);
}
async function downloadBuffer(content, dlKind) {
  const stream = await downloadContentFromMessage(content, dlKind);
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}
// Get quoted media first, then the message's own media. kinds = ['image','video',...]
async function getMedia(message, kinds) {
  const q = quotedMedia(message);
  if (q && (!kinds || kinds.indexOf(q.kind) !== -1)) {
    return { kind: q.kind, buffer: await downloadBuffer(q.content, q.dl) };
  }
  const o = ownMedia(message);
  if (o && (!kinds || kinds.indexOf(o.kind) !== -1)) {
    return { kind: o.kind, buffer: await downloadBuffer(o.content, o.dl) };
  }
  return null;
}
// Both own + quoted media at once (for merge commands).
async function getMediaPair(message) {
  const out = {};
  const q = quotedMedia(message);
  const o = ownMedia(message);
  if (q) out.quoted = { kind: q.kind, buffer: await downloadBuffer(q.content, q.dl) };
  if (o) out.own = { kind: o.kind, buffer: await downloadBuffer(o.content, o.dl) };
  return out;
}
function tmpPath(ext) {
  return path.join(os.tmpdir(), 'demon-' + crypto.randomBytes(6).toString('hex') + '.' + ext);
}
function writeTmp(buffer, ext) {
  const p = tmpPath(ext);
  fs.writeFileSync(p, buffer);
  return p;
}
function cleanup() {
  for (const p of arguments) {
    try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch (e) {}
  }
}
function ffmpegPath() {
  try { return require('@ffmpeg-installer/ffmpeg').path; } catch (e) {
    try { return require('ffmpeg-static'); } catch (e2) { return 'ffmpeg'; }
  }
}
function ffmpeg(args, timeoutMs) {
  const timeout = timeoutMs || 120000;
  return new Promise((resolve, reject) => {
    execFile(ffmpegPath(), args, { timeout, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(String(stderr || err.message || err).slice(-400)));
      resolve({ stdout: stdout || '', stderr: stderr || '' });
    });
  });
}
async function avatarUrl(sock, jid) {
  try {
    const u = await sock.profilePictureUrl(jid, 'image');
    if (u) return u;
  } catch (e) {}
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
}
module.exports = {
  quotedMsg, quotedSender, mentionedJids, pickMedia, quotedMedia, ownMedia,
  downloadBuffer, getMedia, getMediaPair, tmpPath, writeTmp, cleanup,
  ffmpegPath, ffmpeg, avatarUrl
};
