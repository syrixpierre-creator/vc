const { run } = require('../lib/compat');
const META = {"file":"random-pap.js","family":"A","command":"pap","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pap",
  aliases: [],
  category: "internet",
  description: "Legacy tool: pap",
  usage: "pap",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
