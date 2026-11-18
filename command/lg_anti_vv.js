const { run } = require('../lib/compat');
const META = {"file":"anti-vv.js","family":"B","command":"retrieve","perms":{"owner":true,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "retrieve",
  aliases: [],
  category: "owner",
  description: "Owner Only - retrieve view once message",
  usage: "",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
