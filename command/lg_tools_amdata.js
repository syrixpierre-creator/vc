const { run } = require('../lib/compat');
const META = {"file":"tools-amdata.js","family":"A","command":"amdata","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "amdata",
  aliases: ["presetam"],
  category: "tools",
  description: "Legacy tool: amdata",
  usage: "amdata",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
