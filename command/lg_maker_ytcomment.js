const { run } = require('../lib/compat');
const META = {"file":"maker-ytcomment.js","family":"A","command":"ytcomment","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ytcomment",
  aliases: [],
  category: "maker",
  description: "Legacy tool: ytcomment <username>|<komentar>",
  usage: "ytcomment <username>|<komentar>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
