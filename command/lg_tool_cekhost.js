const { run } = require('../lib/compat');
const META = {"file":"tool-cekhost.js","family":"A","command":"checkhost","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "checkhost",
  aliases: ["cekhost","check"],
  category: "tools",
  description: "Legacy tool: checkhost",
  usage: "checkhost",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
