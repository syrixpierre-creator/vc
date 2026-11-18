const { run } = require('../lib/compat');
const META = {"file":"exif.js","family":"B","command":"exif","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "exif2",
  aliases: [],
  category: "sticker",
  description: "Extract Exif metadata from a sticker",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
