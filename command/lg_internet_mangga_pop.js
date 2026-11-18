const { run } = require('../lib/compat');
const META = {"file":"internet-mangga-pop.js","family":"A","command":"mangalist","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "mangalist",
  aliases: [],
  category: "internet",
  description: "Legacy tool: mangga-pop",
  usage: "mangga-pop",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
