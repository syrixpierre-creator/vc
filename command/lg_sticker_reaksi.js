const { run } = require('../lib/compat');
const META = {"file":"sticker-reaksi.js","family":"A","command":"reaksi","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "reaksi",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: reaksi",
  usage: "reaksi",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
