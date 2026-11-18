const { run } = require('../lib/compat');
const META = {"file":"ai-flux.js","family":"A","command":"fluximg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "fluximg",
  aliases: [],
  category: "ai",
  description: "Legacy tool: flux <prompt>",
  usage: "flux <prompt>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
