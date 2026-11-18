const { run } = require('../lib/compat');
const META = {"file":"playncs.js","family":"A","command":"playncs","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "playncs",
  aliases: [],
  category: "sound",
  description: "Legacy tool: playncs",
  usage: "playncs",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
