const { run } = require('../lib/compat');
const META = {"file":"search-playstore.js","family":"A","command":"playstoresearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "playstoresearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: playstoresearch <query>",
  usage: "playstoresearch <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
