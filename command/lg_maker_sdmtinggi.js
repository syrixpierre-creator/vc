const { run } = require('../lib/compat');
const META = {"file":"maker-sdmtinggi.js","family":"A","command":"tosdmtinggi","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tosdmtinggi",
  aliases: ["sdmtinggi"],
  category: "maker",
  description: "Legacy tool: tosdmtinggi",
  usage: "tosdmtinggi",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
