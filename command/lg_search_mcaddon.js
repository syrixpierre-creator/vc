const { run } = require('../lib/compat');
const META = {"file":"search-mcaddon.js","family":"A","command":"mcaddon","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "mcaddon",
  aliases: [],
  category: "search",
  description: "Legacy tool: mcaddon",
  usage: "mcaddon",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
