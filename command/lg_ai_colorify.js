const { run } = require('../lib/compat');
const META = {"file":"ai-colorify.js","family":"A","command":"colorify","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "colorify",
  aliases: [],
  category: "ai",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
