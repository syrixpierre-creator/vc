const { run } = require('../lib/compat');
const META = {"file":"tools-tofile.js","family":"A","command":"tofile","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tofile",
  aliases: [],
  category: "tools",
  description: "Legacy tool: tofile <namafile.ext>",
  usage: "tofile <namafile.ext>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
