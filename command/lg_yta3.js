const { run } = require('../lib/compat');
const META = {"file":"yta3.js","family":"A","command":"ytmp3-3","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ytmp3-3",
  aliases: ["yta3"],
  category: "downloader",
  description: "Legacy tool: ytmp3-3",
  usage: "ytmp3-3",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
