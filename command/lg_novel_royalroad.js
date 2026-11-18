const { run } = require('../lib/compat');
const META = {"file":"novel-royalroad.js","family":"A","command":"detail","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "detail",
  aliases: ["latest"],
  category: "novel",
  description: "Legacy tool: rrsearch <judul>",
  usage: "rrsearch <judul>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
