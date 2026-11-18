const { run } = require('../lib/compat');
const META = {"file":"sticker-stikwiki.js","family":"A","command":"stikwiki","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "stikwiki",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: stikwiki <kata kunci>",
  usage: "stikwiki <kata kunci>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
