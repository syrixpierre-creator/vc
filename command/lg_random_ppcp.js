const { run } = require('../lib/compat');
const META = {"file":"random-ppcp.js","family":"A","command":"ppcp","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ppcp",
  aliases: ["ppcouple"],
  category: "random",
  description: "Legacy tool: ppcp",
  usage: "ppcp",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
