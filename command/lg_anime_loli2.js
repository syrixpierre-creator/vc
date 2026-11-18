const { run } = require('../lib/compat');
const META = {"file":"anime-loli2.js","family":"A","command":"loli2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "loli2",
  aliases: [],
  category: "anime",
  description: "Legacy tool: loli2",
  usage: "loli2",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
