const { run } = require('../lib/compat');
const META = {"file":"tools-ekspedisilist.js","family":"A","command":"ekspedisilist","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ekspedisilist",
  aliases: [],
  category: "tools",
  description: "Legacy tool: ekspedisilist",
  usage: "ekspedisilist",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
