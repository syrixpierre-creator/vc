const { run } = require('../lib/compat');
const META = {"file":"tools-kodebahasa.js","family":"A","command":"kodebahasa","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kodebahasa",
  aliases: ["kodebhs"],
  category: "tools",
  description: "Legacy tool: kodebahasa",
  usage: "kodebahasa",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
