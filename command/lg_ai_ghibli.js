const { run } = require('../lib/compat');
const META = {"file":"ai-ghibli.js","family":"A","command":"ghibli","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ghibli",
  aliases: [],
  category: "ai",
  description: "Legacy tool: ghibli",
  usage: "ghibli",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
