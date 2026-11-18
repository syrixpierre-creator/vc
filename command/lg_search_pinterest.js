const { run } = require('../lib/compat');
const META = {"file":"search-pinterest.js","family":"A","command":"pinterest","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pinterest",
  aliases: ["pin"],
  category: "search",
  description: "Legacy tool: pinterest <query> <jumlah>",
  usage: "pinterest <query> <jumlah>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
