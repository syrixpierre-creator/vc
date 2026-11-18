const { run } = require('../lib/compat');
const META = {"file":"ai-kurumi.js","family":"A","command":"kurumi","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kurumi",
  aliases: [],
  category: "ai",
  description: "Legacy tool: kurumi <teks>",
  usage: "kurumi <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
