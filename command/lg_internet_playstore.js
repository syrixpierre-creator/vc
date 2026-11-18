const { run } = require('../lib/compat');
const META = {"file":"internet-playstore.js","family":"A","command":"ps","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ps",
  aliases: [],
  category: "internet",
  description: "Legacy tool: playstore",
  usage: "playstore",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
