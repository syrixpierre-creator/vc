const { run } = require('../lib/compat');
const META = {"file":"tools-cap.js","family":"A","command":"caption","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "caption",
  aliases: ["cap"],
  category: "tools",
  description: "Legacy tool: caption <teks>",
  usage: "caption <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
