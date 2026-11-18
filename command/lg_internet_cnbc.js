const { run } = require('../lib/compat');
const META = {"file":"internet-cnbc.js","family":"A","command":"cnbc","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cnbc",
  aliases: [],
  category: "internet",
  description: "Legacy tool: cnbc",
  usage: "cnbc",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
