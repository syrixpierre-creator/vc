const { run } = require('../lib/compat');
const META = {"file":"tools-readviewonce.js","family":"A","command":"rvo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "rvo",
  aliases: [],
  category: "tools",
  description: "Legacy tool: rvo",
  usage: "rvo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
