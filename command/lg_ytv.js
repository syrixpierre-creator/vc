const { run } = require('../lib/compat');
const META = {"file":"ytv.js","family":"A","command":"videoyt","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "videoyt",
  aliases: [],
  category: "downloader",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
