const { run } = require('../lib/compat');
const META = {"file":"addmoney.js","family":"A","command":"addmoney","perms":{"owner":true,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "addmoney",
  aliases: [],
  category: "misc",
  description: "Imported tool",
  usage: "",
  ownerOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
