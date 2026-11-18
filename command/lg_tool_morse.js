const { run } = require('../lib/compat');
const META = {"file":"tool-morse.js","family":"A","command":"morse","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "morse",
  aliases: ["demorse"],
  category: "fun",
  description: "Legacy tool: morse",
  usage: "morse",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
