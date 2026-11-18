const { run } = require('../lib/compat');
const META = {"file":"quotes-bucin.js","family":"A","command":"quotebucin","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "quotebucin",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: quotebucin",
  usage: "quotebucin",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
