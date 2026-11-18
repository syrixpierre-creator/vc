const { run } = require('../lib/compat');
const META = {"file":"addexp.js","family":"A","command":"addexp","perms":{"owner":true,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "addexp",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
