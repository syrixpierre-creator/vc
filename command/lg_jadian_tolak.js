const { run } = require('../lib/compat');
const META = {"file":"jadian-tolak.js","family":"A","command":"tolak","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tolak",
  aliases: [],
  category: "fun",
  description: "Legacy tool: tolak",
  usage: "tolak",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
