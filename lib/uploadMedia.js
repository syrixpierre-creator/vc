const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function uploadToCatbox(buffer, filename = 'file.bin') {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, { filename });
  const r = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    timeout: 60000,
    maxContentLength: 50 * 1024 * 1024,
    maxBodyLength: 50 * 1024 * 1024
  });
  if (typeof r.data === 'string' && /^https?:\/\//i.test(r.data.trim())) {
    return r.data.trim();
  }
  throw new Error('Catbox upload fail: ' + String(r.data).slice(0, 100));
}

async function downloadUrl(url) {
  const r = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    maxContentLength: 50 * 1024 * 1024,
    headers: { 'User-Agent': 'QUEEN-AKUMA/1.0' }
  });
  return Buffer.from(r.data);
}

module.exports = { uploadToCatbox, downloadUrl };
