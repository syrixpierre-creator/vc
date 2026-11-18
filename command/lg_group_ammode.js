const { run } = require('../lib/compat');
const META = {"file":"Group-ammode.js","family":"A","command":"ammode","perms":{"owner":true,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ammode",
  aliases: ["modeam"],
  category: "group",
  description: "Legacy tool: ammode on",
  usage: "ammode on",
  ownerOnly: true,
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
