const { run } = require('../lib/compat');
const META = {"file":"pindl2.js","family":"A","command":"pindl2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pindl2",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: pindl2",
  usage: "pindl2",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
