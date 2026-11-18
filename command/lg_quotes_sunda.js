const { run } = require('../lib/compat');
const META = {"file":"quotes-sunda.js","family":"A","command":"syairsunda","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "syairsunda",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: syairsunda",
  usage: "syairsunda",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
