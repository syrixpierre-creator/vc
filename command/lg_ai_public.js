const { run } = require('../lib/compat');
const META = {"file":"ai-public.js","family":"A","command":"publicai","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "publicai",
  aliases: [],
  category: "ai",
  description: "Legacy tool: publicai",
  usage: "publicai",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
