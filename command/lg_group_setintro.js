const { run } = require('../lib/compat');
const META = {"file":"group-setintro.js","family":"A","command":"setintro","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":false,"private":false}};

module.exports = {
  command: "setintro",
  aliases: ["intro","delintro"],
  category: "group",
  description: "Legacy tool: setintro",
  usage: "setintro",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
