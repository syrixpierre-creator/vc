const { run } = require('../lib/compat');
const META = {"file":"down-pindl.js","family":"A","command":"pindl","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pindl",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: pindl",
  usage: "pindl",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
