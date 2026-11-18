const { run } = require('../lib/compat');
const META = {"file":"group-add.js","family":"B","command":"memberadd","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "memberadd",
  aliases: [],
  category: "group",
  description: "Add members from any city/country (Max 5 numbers)",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
