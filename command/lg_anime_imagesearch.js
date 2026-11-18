const { run } = require('../lib/compat');
const META = {"file":"anime-imagesearch.js","family":"A","command":"animesearch","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "animesearch",
  aliases: [],
  category: "anime",
  description: "Legacy tool: animesearch",
  usage: "animesearch",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
