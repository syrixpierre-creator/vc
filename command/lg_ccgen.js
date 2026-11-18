const { run } = require('../lib/compat');
const META = {"file":"ccgen.js","family":"A","command":"ccgen","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ccgen",
  aliases: [],
  category: "tools",
  description: "Legacy tool: ccgen <type> <jumlah>",
  usage: "ccgen <type> <jumlah>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
