const { run } = require('../lib/compat');
const META = {"file":"anime-otakudesu.js","family":"A","command":"otakudesu","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "otakudesu",
  aliases: [],
  category: "anime",
  description: "Legacy tool: otakudesu",
  usage: "otakudesu",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
