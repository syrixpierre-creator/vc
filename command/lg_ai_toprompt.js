const { run } = require('../lib/compat');
const META = {"file":"ai-toprompt.js","family":"A","command":"imageprompt","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "imageprompt",
  aliases: ["toprompt"],
  category: "ai",
  description: "Legacy tool: imageprompt",
  usage: "imageprompt",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
