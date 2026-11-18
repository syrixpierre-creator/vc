const { run } = require('../lib/compat');
const META = {"file":"tool-cekml.js","family":"A","command":"cekml","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekml",
  aliases: ["checkml","mlcheck"],
  category: "stalk",
  description: "Legacy tool: cekml <id> <server>",
  usage: "cekml <id> <server>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
