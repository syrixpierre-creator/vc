const { run } = require('../lib/compat');
const META = {"file":"ai-epsilon.js","family":"A","command":"epsilon","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "epsilon",
  aliases: [],
  category: "ai",
  description: "Legacy tool: epsilon",
  usage: "epsilon",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
