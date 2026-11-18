const { run } = require('../lib/compat');
const META = {"file":"tools-ssweb.js","family":"A","command":"webss","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "webss",
  aliases: ["recordweb"],
  category: "tools",
  description: "Legacy tool: ssweb",
  usage: "ssweb",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
