const { run } = require('../lib/compat');
const META = {"file":"group-linkgrup.js","family":"A","command":"linkgrup","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":true,"private":false}};

module.exports = {
  command: "linkgrup",
  aliases: [],
  category: "group",
  description: "Legacy tool: linkgrup",
  usage: "linkgrup",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
