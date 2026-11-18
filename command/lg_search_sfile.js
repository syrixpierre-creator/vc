const { run } = require('../lib/compat');
const META = {"file":"search-sfile.js","family":"A","command":"sfilesearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sfilesearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: sfilesearch",
  usage: "sfilesearch",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
