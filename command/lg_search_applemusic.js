const { run } = require('../lib/compat');
const META = {"file":"search-applemusic.js","family":"A","command":"applemusicsearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "applemusicsearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: applemusicsearch <judul lagu>",
  usage: "applemusicsearch <judul lagu>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
