const { run } = require('../lib/compat');
const META = {"file":"fun-kematian.js","family":"A","command":"kematian","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kematian",
  aliases: [],
  category: "fun",
  description: "Legacy tool: kematian <nama opsional>",
  usage: "kematian <nama opsional>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
