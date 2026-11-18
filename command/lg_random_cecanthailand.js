const { run } = require('../lib/compat');
const META = {"file":"random-cecanthailand.js","family":"A","command":"cecanthai","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cecanthai",
  aliases: [],
  category: "random",
  description: "Legacy tool: cecanthai",
  usage: "cecanthai",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
