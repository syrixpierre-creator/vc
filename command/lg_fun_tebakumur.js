const { run } = require('../lib/compat');
const META = {"file":"fun-tebakumur.js","family":"A","command":"tebakumur","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tebakumur",
  aliases: [],
  category: "fun",
  description: "Legacy tool: tebakumur",
  usage: "tebakumur",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
