const { run } = require('../lib/compat');
const META = {"file":"internet-luvyaa.js","family":"A","command":"luvyaa","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "luvyaa",
  aliases: [],
  category: "internet",
  description: "Legacy tool: luvyaa",
  usage: "luvyaa",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
