const { run } = require('../lib/compat');
const META = {"file":"ai-codegen.js","family":"A","command":"codegen","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "codegen",
  aliases: [],
  category: "tools",
  description: "Legacy tool: codegen <lang> <model> <prompt>",
  usage: "codegen <lang> <model> <prompt>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
