const { run } = require('../lib/compat');
const META = {"file":"info-toplimit.js","family":"A","command":"toplimit","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "toplimit",
  aliases: [],
  category: "info",
  description: "Legacy tool: toplimit",
  usage: "toplimit",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
