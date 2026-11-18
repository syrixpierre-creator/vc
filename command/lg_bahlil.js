const { run } = require('../lib/compat');
const META = {"file":"bahlil.js","family":"A","command":"bahlil","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bahlil",
  aliases: ["bratbahlil"],
  category: "maker",
  description: "Legacy tool: bahlil",
  usage: "bahlil",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
