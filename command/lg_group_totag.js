const { run } = require('../lib/compat');
const META = {"file":"group-totag.js","family":"A","command":"totag","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":false,"private":false}};

module.exports = {
  command: "totag",
  aliases: [],
  category: "group",
  description: "Legacy tool: totag",
  usage: "totag",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
