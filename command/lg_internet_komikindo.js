const { run } = require('../lib/compat');
const META = {"file":"internet-komikindo.js","family":"A","command":"komikindo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "komikindo",
  aliases: [],
  category: "internet",
  description: "Legacy tool: komikindo",
  usage: "komikindo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
