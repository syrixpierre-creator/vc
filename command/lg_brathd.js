const { run } = require('../lib/compat');
const META = {"file":"brathd.js","family":"A","command":"brathd","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "brathd",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: brathd <text>",
  usage: "brathd <text>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
