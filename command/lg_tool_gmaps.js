const { run } = require('../lib/compat');
const META = {"file":"tool-gmaps.js","family":"A","command":"jarak","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jarak",
  aliases: [],
  category: "tools",
  description: "Legacy tool: jarak",
  usage: "jarak",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
