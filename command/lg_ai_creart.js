const { run } = require('../lib/compat');
const META = {"file":"ai-creart.js","family":"B","command":"creart","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "creart2",
  aliases: ["createart","art","aiart"],
  category: "ai",
  description: "Generate AI images using Creart AI",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
