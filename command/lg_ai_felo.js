const { run } = require('../lib/compat');
const META = {"file":"ai-felo.js","family":"A","command":"felo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "felo",
  aliases: [],
  category: "ai",
  description: "Legacy tool: felo",
  usage: "felo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
