const { run } = require('../lib/compat');
const META = {"file":"anime-info.js","family":"A","command":"animeinfo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "animeinfo",
  aliases: [],
  category: "internet",
  description: "Legacy tool: animeinfo <anime>",
  usage: "animeinfo <anime>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
