const { run } = require('../lib/compat');
const META = {"file":"internet-misteri.js","family":"A","command":"misteri","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "misteri",
  aliases: [],
  category: "internet",
  description: "Legacy tool: misteri",
  usage: "misteri",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
