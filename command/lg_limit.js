const { run } = require('../lib/compat');
const META = {"file":"limit.js","family":"A","command":"limit","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "limit",
  aliases: [],
  category: "main",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
