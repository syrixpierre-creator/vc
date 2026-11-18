const { run } = require('../lib/compat');
const META = {"file":"download-Xhs.js","family":"A","command":"xhs","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "xhs",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: xhs",
  usage: "xhs",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
