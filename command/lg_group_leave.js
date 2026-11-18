const { run } = require('../lib/compat');
const META = {"file":"group-leave.js","family":"B","command":"left","perms":{"owner":true,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "left",
  aliases: ["leftgc"],
  category: "owner",
  description: "Leave the group",
  usage: "",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
