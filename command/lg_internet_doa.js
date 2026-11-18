const { run } = require('../lib/compat');
const META = {"file":"internet-doa.js","family":"A","command":"doa","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "doa",
  aliases: [],
  category: "internet",
  description: "Legacy tool: doa <kata kunci>",
  usage: "doa <kata kunci>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
