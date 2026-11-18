const { run } = require('../lib/compat');
const META = {"file":"tool-jadwaltv.js","family":"A","command":"jadwaltv","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jadwaltv",
  aliases: [],
  category: "tools",
  description: "Legacy tool: jadwaltv",
  usage: "jadwaltv",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
