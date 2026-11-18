const { run } = require('../lib/compat');
const META = {"file":"jadian-putus.js","family":"A","command":"putus","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "putus",
  aliases: [],
  category: "fun",
  description: "Legacy tool: putus",
  usage: "putus",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
