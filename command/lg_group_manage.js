const { run } = require('../lib/compat');
const META = {"file":"group-manage.js","family":"A","command":"opengc","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":true,"private":false}};

module.exports = {
  command: "opengc",
  aliases: ["closegc"],
  category: "group",
  description: "Legacy tool: add",
  usage: "add",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
