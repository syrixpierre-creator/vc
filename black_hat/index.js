const { gmd, commands } = require('./gmdCmds');
const fs = require('fs');
const path = require('path');

// Helpers utilisés par les plugins Gifted-Tech (avant : absents → plugin cassé au chargement)
const MIME = { mp4: 'video/mp4', mkv: 'video/x-matroska', webm: 'video/webm', mov: 'video/quicktime', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf', zip: 'application/zip', apk: 'application/vnd.android.package-archive', txt: 'text/plain', json: 'application/json', js: 'text/javascript', html: 'text/html', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
function getMimeFromUrl(u) { const ext = String(u || '').split('?')[0].split('.').pop().toLowerCase(); return MIME[ext] || 'application/octet-stream'; }
function getExtensionFromMime(m) { const e = Object.entries(MIME).find(([, v]) => v === m); return e ? e[0] : 'bin'; }
function getMimeCategory(m) { m = String(m || ''); return m.startsWith('image/') ? 'image' : m.startsWith('video/') ? 'video' : m.startsWith('audio/') ? 'audio' : 'document'; }
function isTextContent(m) { return /^text\/|json|javascript|xml/.test(String(m || '')); }
function formatBytes(b, d = 2) { b = Number(b) || 0; if (!b) return '0 B'; const k = 1024, u = ['B', 'KB', 'MB', 'GB', 'TB']; const i = Math.floor(Math.log(b) / Math.log(k)); return (b / Math.pow(k, i)).toFixed(d) + ' ' + u[i]; }
function monospace(t) { return '```' + t + '```'; }
async function getFileSize(url) { try { const r = await require('axios').head(url, { timeout: 15000 }); return Number(r.headers['content-length']) || 0; } catch (_) { return 0; } }
function copyFolderSync(src, dst) { fs.cpSync(src, dst, { recursive: true }); }
const gitRepoRegex = /(?:https?:\/\/|git@)github\.com[\/:]([^\/:]+)\/(.+?)(?:\.git|\/|$)/i;
const MAX_MEDIA_SIZE = 100 * 1024 * 1024;
module.exports = {
  gmd,
  commands,
  gmdSticker: () => {},
  getGroupMetadata: async (sock, jid) => { try { return await sock.groupMetadata(jid); } catch (_) { return null; } },
  getMimeFromUrl, getExtensionFromMime, getMimeCategory, isTextContent, formatBytes, monospace,
  getFileSize, copyFolderSync, gitRepoRegex, MAX_MEDIA_SIZE,
  getLidMapping: async () => ({}),
  getSetting: () => null,
  setSetting: () => {},
  getAllSettings: () => ({}),
  resetSetting: () => {},
  resetAllSettings: () => {},
  getContextInfo: () => ({})
};
