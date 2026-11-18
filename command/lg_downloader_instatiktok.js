const { run } = require('../lib/compat');
const META = {"file":"downloader-instatiktok.js","family":"A","command":"dlit","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dlit",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: dlit <platform> <url>",
  usage: "dlit <platform> <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
