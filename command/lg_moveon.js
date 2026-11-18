const { run } = require('../lib/compat');
const META = {"file":"moveon.js","family":"A","command":"moveon","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "moveon",
  aliases: [],
  category: "fun",
  description: "Legacy tool: moveon",
  usage: "moveon",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
