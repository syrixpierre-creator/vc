const { run } = require('../lib/compat');
const META = {"file":"group-pinpesan.js","family":"A","command":"pinpesan","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":true,"private":false}};

module.exports = {
  command: "pinpesan",
  aliases: [],
  category: "group",
  description: "Legacy tool: pinpesan",
  usage: "pinpesan",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
