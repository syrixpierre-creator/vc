const { run } = require('../lib/compat');
const META = {"file":"downloader-threads.js","family":"A","command":"threads","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "threads",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: threads",
  usage: "threads",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
