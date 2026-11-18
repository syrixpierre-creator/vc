const { run } = require('../lib/compat');
const META = {"file":"anime-loli.js","family":"A","command":"loli","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "loli",
  aliases: [],
  category: "anime",
  description: "Legacy tool: loli",
  usage: "loli",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
