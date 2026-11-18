const { run } = require('../lib/compat');
const META = {"file":"ai-dolphin.js","family":"A","command":"dolphin","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dolphin",
  aliases: [],
  category: "ai",
  description: "Legacy tool: dolphin <pertanyaan>",
  usage: "dolphin <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
