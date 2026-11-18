const { run } = require('../lib/compat');
const META = {"file":"search-webton.js","family":"A","command":"webtoonsearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "webtoonsearch",
  aliases: [],
  category: "search",
  description: "Legacy tool: webtoonsearch <judul>",
  usage: "webtoonsearch <judul>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
