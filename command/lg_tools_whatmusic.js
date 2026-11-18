const { run } = require('../lib/compat');
const META = {"file":"tools-whatmusic.js","family":"A","command":"whatmusik","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "whatmusik",
  aliases: ["wmusic"],
  category: "tools",
  description: "Legacy tool: whatmusic",
  usage: "whatmusic",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
