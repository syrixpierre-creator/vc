const { run } = require('../lib/compat');
const META = {"file":"yta2.js","family":"A","command":"ytmp3-2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ytmp3-2",
  aliases: ["yta2"],
  category: "downloader",
  description: "Legacy tool: ytmp3-2 <link youtube>",
  usage: "ytmp3-2 <link youtube>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
