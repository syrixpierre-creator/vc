const { run } = require('../lib/compat');
const META = {"file":"transcibe.js","family":"A","command":"transcibe","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "transcibe",
  aliases: [],
  category: "tools",
  description: "Legacy tool: transcibe url-video-yt",
  usage: "transcibe url-video-yt",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
