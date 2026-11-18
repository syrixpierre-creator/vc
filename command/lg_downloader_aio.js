const { run } = require('../lib/compat');
const META = {"file":"downloader-aio.js","family":"A","command":"aio","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "aio",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: aio <url>",
  usage: "aio <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
