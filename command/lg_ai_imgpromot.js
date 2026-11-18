const { run } = require('../lib/compat');
const META = {"file":"ai-imgpromot.js","family":"A","command":"img2promt","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "img2promt",
  aliases: [],
  category: "ai",
  description: "Legacy tool: img2promt",
  usage: "img2promt",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
