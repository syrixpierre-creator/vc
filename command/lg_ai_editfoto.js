const { run } = require('../lib/compat');
const META = {"file":"ai-editfoto.js","family":"A","command":"editfoto","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "editfoto",
  aliases: [],
  category: "ai",
  description: "Legacy tool: editfoto <prompt>",
  usage: "editfoto <prompt>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
