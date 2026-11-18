const { run } = require('../lib/compat');
const META = {"file":"cekhodam.js","family":"A","command":"cekkhodam","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekkhodam",
  aliases: [],
  category: "fun",
  description: "Legacy tool: cekkhodam *<name>*",
  usage: "cekkhodam *<name>*",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
