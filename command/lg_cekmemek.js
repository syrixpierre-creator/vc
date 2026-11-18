const { run } = require('../lib/compat');
const META = {"file":"cekmemek.js","family":"A","command":"cekmemek","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekmemek",
  aliases: ["cekmmk"],
  category: "fun",
  description: "Legacy tool: cekmemek *<name>*",
  usage: "cekmemek *<name>*",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
