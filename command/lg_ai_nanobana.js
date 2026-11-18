const { run } = require('../lib/compat');
const META = {"file":"ai-nanobana.js","family":"A","command":"editimage","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "editimage",
  aliases: ["nanobanana"],
  category: "ai",
  description: "Legacy tool: editimage",
  usage: "editimage",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
