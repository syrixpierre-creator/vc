const { run } = require('../lib/compat');
const META = {"file":"quotes-senja.js","family":"A","command":"senja","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "senja",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: senja",
  usage: "senja",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
