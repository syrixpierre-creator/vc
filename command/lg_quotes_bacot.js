const { run } = require('../lib/compat');
const META = {"file":"quotes-bacot.js","family":"A","command":"bacot","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bacot",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: bacot",
  usage: "bacot",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
