const { run } = require('../lib/compat');
const META = {"file":"search-resep.js","family":"A","command":"resep","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "resep",
  aliases: [],
  category: "misc",
  description: "Legacy tool: resep",
  usage: "resep",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
