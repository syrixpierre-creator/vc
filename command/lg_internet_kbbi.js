const { run } = require('../lib/compat');
const META = {"file":"internet-kbbi.js","family":"A","command":"kbbi","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kbbi",
  aliases: [],
  category: "internet",
  description: "Legacy tool: kbbi",
  usage: "kbbi",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
