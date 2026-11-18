const { run } = require('../lib/compat');
const META = {"file":"search-uptodown.js","family":"A","command":"uptodown","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "uptodown",
  aliases: [],
  category: "search",
  description: "Legacy tool: uptodown",
  usage: "uptodown",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
