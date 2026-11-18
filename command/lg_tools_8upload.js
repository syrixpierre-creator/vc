const { run } = require('../lib/compat');
const META = {"file":"tools-8upload.js","family":"A","command":"8upload","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "8upload",
  aliases: [],
  category: "tools",
  description: "Legacy tool: 8upload",
  usage: "8upload",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
