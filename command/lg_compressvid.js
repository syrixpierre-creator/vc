const { run } = require('../lib/compat');
const META = {"file":"compressvid.js","family":"A","command":"compress","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "compress",
  aliases: ["kompres"],
  category: "tools",
  description: "Legacy tool: compress auto",
  usage: "compress auto",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
