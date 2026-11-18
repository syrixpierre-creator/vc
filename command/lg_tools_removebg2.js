const { run } = require('../lib/compat');
const META = {"file":"tools-removebg2.js","family":"A","command":"removebg2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "removebg2",
  aliases: ["removebghd"],
  category: "tools",
  description: "Legacy tool: removebg2",
  usage: "removebg2",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
