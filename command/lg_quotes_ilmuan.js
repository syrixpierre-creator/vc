const { run } = require('../lib/compat');
const META = {"file":"quotes-ilmuan.js","family":"A","command":"quotesilmuan","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "quotesilmuan",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: quotesilmuan",
  usage: "quotesilmuan",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
