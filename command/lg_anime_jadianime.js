const { run } = require('../lib/compat');
const META = {"file":"anime-jadianime.js","family":"A","command":"toanime","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "toanime",
  aliases: [],
  category: "anime",
  description: "Legacy tool: toanime",
  usage: "toanime",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
