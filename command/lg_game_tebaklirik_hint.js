const { run } = require('../lib/compat');
const META = {"file":"game-tebaklirik_hint.js","family":"A","command":"terik","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "terik",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
