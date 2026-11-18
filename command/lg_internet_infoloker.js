const { run } = require('../lib/compat');
const META = {"file":"internet-infoloker.js","family":"A","command":"infoloker","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "infoloker",
  aliases: [],
  category: "internet",
  description: "Legacy tool: infoloker",
  usage: "infoloker",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
