const { run } = require('../lib/compat');
const META = {"file":"search-grupwa.js","family":"A","command":"grupwasearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "grupwasearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: grupwasearch <query>",
  usage: "grupwasearch <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
