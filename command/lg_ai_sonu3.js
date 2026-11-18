const { run } = require('../lib/compat');
const META = {"file":"ai-sonu3.js","family":"A","command":"sonu3","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sonu3",
  aliases: [],
  category: "ai",
  description: "Legacy tool: sonu3",
  usage: "sonu3",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
