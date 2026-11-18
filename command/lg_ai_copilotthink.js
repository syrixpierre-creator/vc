const { run } = require('../lib/compat');
const META = {"file":"ai-copilotthink.js","family":"A","command":"copilotthink","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "copilotthink",
  aliases: [],
  category: "ai",
  description: "Legacy tool: copilotthink <pertanyaan>",
  usage: "copilotthink <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
