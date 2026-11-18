const { run } = require('../lib/compat');
const META = {"file":"lahelu.js","family":"A","command":"lahelu","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "lahelu",
  aliases: [],
  category: "random",
  description: "Legacy tool: lahelu",
  usage: "lahelu",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
