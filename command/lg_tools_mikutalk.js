const { run } = require('../lib/compat');
const META = {"file":"tools-mikutalk.js","family":"A","command":"mikutalk","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "mikutalk",
  aliases: [],
  category: "tools",
  description: "Legacy tool: mikutalk <teks>",
  usage: "mikutalk <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
