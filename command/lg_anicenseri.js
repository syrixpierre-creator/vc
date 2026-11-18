const { run } = require('../lib/compat');
const META = {"file":"anicenseri.js","family":"A","command":"anichinseri","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "anichinseri",
  aliases: [],
  category: "anime",
  description: "Legacy tool: anichinseri <url>",
  usage: "anichinseri <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
