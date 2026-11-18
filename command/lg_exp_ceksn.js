const { run } = require('../lib/compat');
const META = {"file":"exp-ceksn.js","family":"A","command":"ceksn","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ceksn",
  aliases: [],
  category: "xp",
  description: "Legacy tool: ceksn",
  usage: "ceksn",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
