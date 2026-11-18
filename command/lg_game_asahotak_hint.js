const { run } = require('../lib/compat');
const META = {"file":"game-asahotak-hint.js","family":"A","command":"hotak","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hotak",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
