const { run } = require('../lib/compat');
const META = {"file":"quotes-islam.js","family":"A","command":"q-islam","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "q-islam",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: q-islam",
  usage: "q-islam",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
