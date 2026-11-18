const { run } = require('../lib/compat');
const META = {"file":"tools-cekidch.js","family":"A","command":"cekidch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekidch",
  aliases: ["idch"],
  category: "tools",
  description: "Legacy tool: cekidch",
  usage: "cekidch",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
