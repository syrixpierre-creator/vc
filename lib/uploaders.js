/**
 * QUEEN AKUMA uploaders — upload a local file (path or Buffer) to a free host and get a public link.
 * Every function resolves to { url, host }.
 */
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

function toFile(input, name) {
  const buf = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
  const fname = name || (Buffer.isBuffer(input) ? 'file.bin' : path.basename(input));
  return { buf, fname };
}
async function post(url, form, timeout = 60000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { method: 'POST', body: form, signal: ctl.signal, headers: { 'user-agent': UA } });
    const txt = await r.text();
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return txt;
  } finally { clearTimeout(t); }
}
const json = (t) => { try { return JSON.parse(t); } catch (_) { throw new Error('bad response: ' + String(t).slice(0, 80)); } };
const must = (url, host) => {
  const u = String(url || '').trim();
  if (!/^https?:\/\//i.test(u)) throw new Error(host + ' returned no link');
  return { url: u, host };
};
function form(field, input, name, extra = {}) {
  const { buf, fname } = toFile(input, name);
  const f = new FormData();
  for (const [k, v] of Object.entries(extra)) f.append(k, v);
  f.append(field, new Blob([buf]), fname);
  return f;
}

async function uploadToCatbox(input, name) {
  return must(await post('https://catbox.moe/user/api.php', form('fileToUpload', input, name, { reqtype: 'fileupload' })), 'catbox');
}
async function uploadToLitterbox(input, name, time = '72h') {
  return must(await post('https://litterbox.catbox.moe/resources/internals/api.php', form('fileToUpload', input, name, { reqtype: 'fileupload', time })), 'litterbox');
}
async function uploadToTmpfiles(input, name) {
  const j = json(await post('https://tmpfiles.org/api/v1/upload', form('file', input, name)));
  return must(String(j.data && j.data.url).replace('tmpfiles.org/', 'tmpfiles.org/dl/'), 'tmpfiles');
}
async function uploadToUguu(input, name) {
  const j = json(await post('https://uguu.se/upload', form('files[]', input, name)));
  return must(j.files && j.files[0] && j.files[0].url, 'uguu');
}
async function uploadToX0(input, name) {
  return must(await post('https://x0.at/', form('file', input, name)), 'x0.at');
}
async function uploadToPomf2(input, name) {
  const j = json(await post('https://pomf2.lain.la/upload.php', form('files[]', input, name)));
  return must(j.files && j.files[0] && j.files[0].url, 'pomf2');
}
async function uploadToQuax(input, name) {
  const j = json(await post('https://qu.ax/upload.php', form('files[]', input, name)));
  return must(j.files && j.files[0] && j.files[0].url, 'qu.ax');
}
async function uploadToPixhost(input, name) {
  const j = json(await post('https://api.pixhost.to/images', form('img', input, name, { content_type: '0' })));
  const showUrl = j.show_url;
  if (!showUrl) throw new Error('pixhost returned no link');
  // Direct image URL nikaalo (page scrape) — show_url sirf page hota hai.
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const page = await fetch(showUrl, { signal: ctl.signal, headers: { 'user-agent': UA } }).then((r) => r.text()).finally(() => clearTimeout(t));
    const m = String(page).match(/<img id="image" src="([^"]+)"/);
    if (m && m[1]) return { url: m[1], host: 'pixhost' };
  } catch (_) {}
  return { url: showUrl, host: 'pixhost' };
}
async function uploadToFreeimage(input, name) {
  // Key sirf env se — hardcoded key kabhi use nahi karni.
  const key = process.env.FREEIMAGE_KEY;
  if (!key) throw new Error('FREEIMAGE_KEY not set in env');
  const j = json(await post('https://freeimage.host/api/1/upload?key=' + key, form('source', input, name, { action: 'upload', format: 'json' })));
  return must(j.image && j.image.url, 'freeimage');
}

/** try several hosts until one works */
async function upload(input, name) {
  const chain = [uploadToCatbox, uploadToUguu, uploadToTmpfiles, uploadToX0, uploadToQuax, uploadToPomf2];
  const errs = [];
  for (const fn of chain) {
    try { return await fn(input, name); } catch (e) { errs.push(fn.name + ': ' + e.message); }
  }
  throw new Error('all upload hosts failed (' + errs.join(' | ') + ')');
}

/** fast path: 3 hosts parallel race — jo pehle link de, wo jeetta hai */
async function uploadFast(input, name) {
  try {
    return await Promise.any([
      uploadToCatbox(input, name), uploadToQuax(input, name), uploadToUguu(input, name),
    ]);
  } catch (_) { return upload(input, name); }
}

module.exports = {
  uploadToCatbox, uploadToLitterbox, uploadToTmpfiles, uploadToUguu, uploadToX0, uploadToPomf2, uploadToQuax, uploadToPixhost, uploadToFreeimage,
  upload, uploadImage: upload, uploadFile: upload, uploadFast, uploadFileFast: uploadFast, telegra: upload, litterbox: uploadToLitterbox
};
