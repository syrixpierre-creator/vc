const { run } = require('../lib/compat');
const META = {"file":"random-cecanindo.js","family":"A","command":"cecanindo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cecanindo",
  aliases: [],
  category: "random",
  description: "Legacy tool: cecanindo",
  usage: "cecanindo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
