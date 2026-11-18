const { run } = require('../lib/compat');
const META = {"file":"game-tebaklogo_hint.js","family":"A","command":"hlogo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hlogo",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
