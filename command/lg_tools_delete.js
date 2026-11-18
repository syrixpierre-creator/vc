const { run } = require('../lib/compat');
const META = {"file":"tools-delete.js","family":"A","command":"hps","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hps",
  aliases: ["hapus","erase"],
  category: "tools",
  description: "Legacy tool: del",
  usage: "del",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
