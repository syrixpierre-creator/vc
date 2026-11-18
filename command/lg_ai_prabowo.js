const { run } = require('../lib/compat');
const META = {"file":"ai-prabowo.js","family":"A","command":"prabowo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "prabowo",
  aliases: [],
  category: "ai",
  description: "Legacy tool: prabowo",
  usage: "prabowo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
