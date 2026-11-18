const { run } = require('../lib/compat');
const META = {"file":"searchcode.js","family":"A","command":"searchcode","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "searchcode",
  aliases: [],
  category: "tools",
  description: "Legacy tool: searchcode",
  usage: "searchcode",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
