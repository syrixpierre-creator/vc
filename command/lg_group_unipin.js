const { run } = require('../lib/compat');
const META = {"file":"group-unipin.js","family":"A","command":"unpin","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":true,"private":false}};

module.exports = {
  command: "unpin",
  aliases: [],
  category: "group",
  description: "Legacy tool: unpin",
  usage: "unpin",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
