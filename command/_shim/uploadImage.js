const { uploadImage } = require('../../lib/uploadImage');
const { uploadToPomf2 } = require('../../lib/uploaders');
async function uploadPomf(input, name) {
  const r = await uploadToPomf2(input, name);
  return typeof r === 'string' ? r : r.url;
}
module.exports = { uploadImage, uploadPomf };
