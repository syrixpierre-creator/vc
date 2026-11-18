const { run } = require('../lib/compat');
const META = {"file":"getcode.js","family":"A","command":"getcode","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "getcode",
  aliases: [],
  category: "tools",
  description: "Legacy tool: getcode <url>",
  usage: "getcode <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
