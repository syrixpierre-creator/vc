const { run } = require('../lib/compat');
const META = {"file":"downloader-capcut.js","family":"A","command":"capcut","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "capcut",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: capcut",
  usage: "capcut",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
