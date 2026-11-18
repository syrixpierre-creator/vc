const { run } = require('../lib/compat');
const META = {"file":"bratbutton.js","family":"A","command":"bratb","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bratb",
  aliases: [],
  category: "tools",
  description: "Legacy tool: bratb",
  usage: "bratb",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
