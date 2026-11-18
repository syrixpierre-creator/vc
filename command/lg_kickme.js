const { run } = require('../lib/compat');
const META = {"file":"kickme.js","family":"A","command":"kickme","perms":{"owner":true,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kickme",
  aliases: ["out"],
  category: "group",
  description: "Legacy tool: leavegc",
  usage: "leavegc",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
