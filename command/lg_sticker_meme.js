const { run } = require('../lib/compat');
const META = {"file":"sticker-meme.js","family":"A","command":"smeme","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "smeme",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: smeme <teks atas>|<teks bawah>",
  usage: "smeme <teks atas>|<teks bawah>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
