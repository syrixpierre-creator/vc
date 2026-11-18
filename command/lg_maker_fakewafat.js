const { run } = require('../lib/compat');
const META = {"file":"maker-fakewafat.js","family":"A","command":"fakewafat","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "fakewafat",
  aliases: [],
  category: "maker",
  description: "Legacy tool: fakewafat",
  usage: "fakewafat",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
