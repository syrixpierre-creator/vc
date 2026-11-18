const { run } = require('../lib/compat');
const META = {"file":"tools-nik.js","family":"A","command":"nik","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "nik",
  aliases: [],
  category: "tools",
  description: "Legacy tool: nik <nomor>",
  usage: "nik <nomor>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
