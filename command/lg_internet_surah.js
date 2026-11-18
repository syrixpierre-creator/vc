const { run } = require('../lib/compat');
const META = {"file":"internet-surah.js","family":"A","command":"surah","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "surah",
  aliases: [],
  category: "internet",
  description: "Legacy tool: surah",
  usage: "surah",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
