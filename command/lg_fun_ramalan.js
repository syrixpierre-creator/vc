const { run } = require('../lib/compat');
const META = {"file":"fun-ramalan.js","family":"A","command":"ramal","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ramal",
  aliases: [],
  category: "fun",
  description: "Legacy tool: ramal <nama opsional>",
  usage: "ramal <nama opsional>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
