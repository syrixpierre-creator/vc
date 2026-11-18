const { run } = require('../lib/compat');
const META = {"file":"tool-igsearch.js","family":"A","command":"igsearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "igsearch",
  aliases: ["igfind","instagramsearch"],
  category: "search",
  description: "Legacy tool: igsearch <query>",
  usage: "igsearch <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
