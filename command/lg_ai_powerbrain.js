const { run } = require('../lib/compat');
const META = {"file":"ai-powerbrain.js","family":"A","command":"powerbrain","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "powerbrain",
  aliases: [],
  category: "ai",
  description: "Legacy tool: powerbrain",
  usage: "powerbrain",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
