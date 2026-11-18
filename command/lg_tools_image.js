const { run } = require('../lib/compat');
const META = {"file":"tools-image.js","family":"A","command":"imgtools","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "imgtools",
  aliases: [],
  category: "tools",
  description: "Legacy tool: imgtools <type>",
  usage: "imgtools <type>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
