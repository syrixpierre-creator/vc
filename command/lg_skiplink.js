const { run } = require('../lib/compat');
const META = {"file":"skiplink.js","family":"A","command":"skiplink","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "skiplink",
  aliases: [],
  category: "tools",
  description: "Legacy tool: skiplink <url>",
  usage: "skiplink <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
