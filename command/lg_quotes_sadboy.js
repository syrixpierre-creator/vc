const { run } = require('../lib/compat');
const META = {"file":"quotes-sadboy.js","family":"A","command":"sadboy","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sadboy",
  aliases: [],
  category: "fun",
  description: "Legacy tool: sadboy",
  usage: "sadboy",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
