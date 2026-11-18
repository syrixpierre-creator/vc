const { run } = require('../lib/compat');
const META = {"file":"tools-hd2.js","family":"A","command":"hd2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hd2",
  aliases: [],
  category: "tools",
  description: "Legacy tool: hd2 <scale> <type>",
  usage: "hd2 <scale> <type>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
