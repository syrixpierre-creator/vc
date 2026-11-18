const { run } = require('../lib/compat');
const META = {"file":"ai-jeeves.js","family":"A","command":"jeeves","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jeeves",
  aliases: [],
  category: "ai",
  description: "Legacy tool: jeeves",
  usage: "jeeves",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
