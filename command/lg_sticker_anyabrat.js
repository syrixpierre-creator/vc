const { run } = require('../lib/compat');
const META = {"file":"sticker-anyabrat.js","family":"A","command":"bratanya","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bratanya",
  aliases: ["anya"],
  category: "maker",
  description: "Legacy tool: bratanya",
  usage: "bratanya",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
