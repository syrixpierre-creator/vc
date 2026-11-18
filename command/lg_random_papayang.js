const { run } = require('../lib/compat');
const META = {"file":"random-papayang.js","family":"A","command":"papayang","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "papayang",
  aliases: [],
  category: "random",
  description: "Legacy tool: papayang",
  usage: "papayang",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
