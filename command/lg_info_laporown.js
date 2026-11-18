const { run } = require('../lib/compat');
const META = {"file":"info-laporown.js","family":"A","command":"lapor","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "lapor",
  aliases: [],
  category: "info",
  description: "Legacy tool: lapor",
  usage: "lapor",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
