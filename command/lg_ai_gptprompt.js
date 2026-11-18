const { run } = require('../lib/compat');
const META = {"file":"ai-gptprompt.js","family":"A","command":"gptprompt","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gptprompt",
  aliases: [],
  category: "ai",
  description: "Legacy tool: gptprompt",
  usage: "gptprompt",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
