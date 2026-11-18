const { run } = require('../lib/compat');
const META = {"file":"fun-alay.js","family":"A","command":"alay","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "alay",
  aliases: [],
  category: "fun",
  description: "Legacy tool: alay",
  usage: "alay",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
