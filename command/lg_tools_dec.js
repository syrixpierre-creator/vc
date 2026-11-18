const { run } = require('../lib/compat');
const META = {"file":"tools-dec.js","family":"A","command":"decode","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "decode",
  aliases: [],
  category: "tools",
  description: "Legacy tool: encode",
  usage: "encode",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
