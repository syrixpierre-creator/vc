const { run } = require('../lib/compat');
const META = {"file":"tools-idgc.js","family":"A","command":"cekidgc","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekidgc",
  aliases: ["idgc"],
  category: "tools",
  description: "Legacy tool: cekidgc",
  usage: "cekidgc",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
