const { run } = require('../lib/compat');
const META = {"file":"anilist.js","family":"A","command":"anilist","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "anilist",
  aliases: [],
  category: "anime",
  description: "Legacy tool: anilist",
  usage: "anilist",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
