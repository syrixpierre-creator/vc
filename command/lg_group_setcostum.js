const { run } = require('../lib/compat');
const META = {"file":"group-setcostum.js","family":"A","command":"setbye","perms":{"owner":false,"rowner":false,"group":true,"admin":true,"botAdmin":false,"private":false}};

module.exports = {
  command: "setbye",
  aliases: ["setpromote","setdemote"],
  category: "group",
  description: "Legacy tool: welcome",
  usage: "welcome",
  groupOnly: true,
  adminOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
