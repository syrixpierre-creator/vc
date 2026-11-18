const { run } = require('../lib/compat');
const META = {"file":"tools-barcode.js","family":"A","command":"barcode","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "barcode",
  aliases: [],
  category: "tools",
  description: "Legacy tool: barcode <teks>",
  usage: "barcode <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
