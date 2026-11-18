const { run } = require('../lib/compat');
const META = {"file":"tools-unblur.js","family":"A","command":"unblur","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "unblur",
  aliases: [],
  category: "tools",
  description: "Legacy tool: unblur",
  usage: "unblur",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
