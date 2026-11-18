const { run } = require('../lib/compat');
const META = {"file":"fun-carabalikan.js","family":"A","command":"carabalikan","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "carabalikan",
  aliases: [],
  category: "fun",
  description: "Legacy tool: carabalikan",
  usage: "carabalikan",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
