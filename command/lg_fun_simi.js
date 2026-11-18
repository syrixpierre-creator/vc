const { run } = require('../lib/compat');
const META = {"file":"fun-simi.js","family":"A","command":"simi","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "simi",
  aliases: [],
  category: "ai",
  description: "Legacy tool: simi",
  usage: "simi",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
