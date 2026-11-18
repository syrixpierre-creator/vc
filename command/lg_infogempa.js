const { run } = require('../lib/compat');
const META = {"file":"infogempa.js","family":"A","command":"infogempa","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "infogempa",
  aliases: [],
  category: "info",
  description: "Legacy tool: infogempa",
  usage: "infogempa",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
