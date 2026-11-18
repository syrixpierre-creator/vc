const { run } = require('../lib/compat');
const META = {"file":"internet-antara.js","family":"A","command":"antara","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "antara",
  aliases: [],
  category: "internet",
  description: "Legacy tool: antara",
  usage: "antara",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
