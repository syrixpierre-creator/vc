const { run } = require('../lib/compat');
const META = {"file":"ai-gita.js","family":"A","command":"gita","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gita",
  aliases: [],
  category: "ai",
  description: "Legacy tool: gita",
  usage: "gita",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
