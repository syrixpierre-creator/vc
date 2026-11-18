// Shim: upload a Buffer and return a public URL (catbox.moe)
const axios = require('axios');
const FormData = require('form-data');
let FileType; try { FileType = require('file-type'); } catch {}
module.exports = async function uploadImage(buffer) {
  let ext = 'jpg';
  try { ext = (await FileType.fromBuffer(buffer))?.ext || 'jpg'; } catch {}
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, { filename: `file.${ext}` });
  const { data } = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 60000 });
  if (typeof data !== 'string' || !/^https?:\/\//.test(data)) throw new Error('upload failed');
  return data.trim();
};
module.exports.default = module.exports;
