const { run } = require('../lib/compat');
const META = {"file":"cekkontol.js","family":"A","command":"cekkontol","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekkontol",
  aliases: [],
  category: "fun",
  description: "Legacy tool: cekkontol *<name>*",
  usage: "cekkontol *<name>*",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
