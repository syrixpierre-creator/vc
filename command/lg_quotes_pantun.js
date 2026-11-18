const { run } = require('../lib/compat');
const META = {"file":"quotes-pantun.js","family":"A","command":"pantun","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pantun",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: pantun",
  usage: "pantun",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
