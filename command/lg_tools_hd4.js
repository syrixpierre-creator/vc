const { run } = require('../lib/compat');
const META = {"file":"tools-hd4.js","family":"A","command":"hd4","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hd4",
  aliases: [],
  category: "tools",
  description: "Legacy tool: hd4",
  usage: "hd4",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
