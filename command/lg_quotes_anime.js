const { run } = require('../lib/compat');
const META = {"file":"quotes-anime.js","family":"A","command":"quotesanime","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "quotesanime",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: quotesanime",
  usage: "quotesanime",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
