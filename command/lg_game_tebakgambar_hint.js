const { run } = require('../lib/compat');
const META = {"file":"game-tebakgambar-hint.js","family":"A","command":"hgamb","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hgamb",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
