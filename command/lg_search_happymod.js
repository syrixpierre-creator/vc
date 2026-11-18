const { run } = require('../lib/compat');
const META = {"file":"search-happymod.js","family":"A","command":"happymodsearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "happymodsearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: happymodsearch <query>",
  usage: "happymodsearch <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
