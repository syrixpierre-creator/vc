const { run } = require('../lib/compat');
const META = {"file":"fun-ceksifat.js","family":"A","command":"ceksifat","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ceksifat",
  aliases: [],
  category: "fun",
  description: "Legacy tool: ceksifat",
  usage: "ceksifat",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
