const { run } = require('../lib/compat');
const META = {"file":"search-douyinsearch.js","family":"A","command":"douyinsearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "douyinsearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: douyinsearch <query>",
  usage: "douyinsearch <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
