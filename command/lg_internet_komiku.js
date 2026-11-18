const { run } = require('../lib/compat');
const META = {"file":"internet-komiku.js","family":"A","command":"komiku","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "komiku",
  aliases: [],
  category: "internet",
  description: "Legacy tool: komiku",
  usage: "komiku",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
