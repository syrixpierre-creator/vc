const { run } = require('../lib/compat');
const META = {"file":"ai-bard.js","family":"A","command":"bard","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bard",
  aliases: [],
  category: "ai",
  description: "Legacy tool: bard <pertanyaan>",
  usage: "bard <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
