const { run } = require('../lib/compat');
const META = {"file":"group-delsw.js","family":"A","command":"delswgc","perms":{"owner":false,"rowner":false,"group":false,"admin":true,"botAdmin":false,"private":false}};

module.exports = {
  command: "delswgc",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
