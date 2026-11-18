const { run } = require('../lib/compat');
const META = {"file":"tools-hd.js","family":"A","command":"hdr","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hdr",
  aliases: [],
  category: "tools",
  description: "Legacy tool: hd",
  usage: "hd",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
