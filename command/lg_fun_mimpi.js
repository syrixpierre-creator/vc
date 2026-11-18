const { run } = require('../lib/compat');
const META = {"file":"fun-mimpi.js","family":"A","command":"dreamworld","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dreamworld",
  aliases: ["dream","mimpi"],
  category: "fun",
  description: "Legacy tool: dreamworld",
  usage: "dreamworld",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
