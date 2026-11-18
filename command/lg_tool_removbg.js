const { run } = require('../lib/compat');
const META = {"file":"tool-removbg.js","family":"A","command":"rbg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "rbg",
  aliases: [],
  category: "tools",
  description: "Legacy tool: removebg",
  usage: "removebg",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
