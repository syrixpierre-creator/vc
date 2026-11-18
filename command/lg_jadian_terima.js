const { run } = require('../lib/compat');
const META = {"file":"jadian-terima.js","family":"A","command":"terima","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "terima",
  aliases: [],
  category: "fun",
  description: "Legacy tool: terima",
  usage: "terima",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
