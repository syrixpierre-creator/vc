const { run } = require('../lib/compat');
const META = {"file":"maker-codesnap.js","family":"A","command":"codesnap","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "codesnap",
  aliases: [],
  category: "maker",
  description: "Legacy tool: codesnap <code>",
  usage: "codesnap <code>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
