const { run } = require('../lib/compat');
const META = {"file":"tools-cekidch2.js","family":"A","command":"cekidch2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekidch2",
  aliases: ["idch2"],
  category: "tools",
  description: "Legacy tool: cekidch2",
  usage: "cekidch2",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
