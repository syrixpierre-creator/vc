const { run } = require('../lib/compat');
const META = {"file":"group-linkgc.js","family":"A","command":"linkgc","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "linkgc",
  aliases: [],
  category: "group",
  description: "Legacy tool: linkgc",
  usage: "linkgc",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
