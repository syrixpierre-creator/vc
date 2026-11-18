const { run } = require('../lib/compat');
const META = {"file":"anime-waifu3.js","family":"A","command":"waifu3","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "waifu3",
  aliases: [],
  category: "anime",
  description: "Legacy tool: waifu3",
  usage: "waifu3",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
