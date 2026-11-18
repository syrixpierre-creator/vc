const { run } = require('../lib/compat');
const META = {"file":"quotes-syairchina.js","family":"A","command":"syairchina","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "syairchina",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: syairchina",
  usage: "syairchina",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
