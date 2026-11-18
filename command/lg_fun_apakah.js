const { run } = require('../lib/compat');
const META = {"file":"fun-apakah.js","family":"A","command":"apakah","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "apakah",
  aliases: [],
  category: "fun",
  description: "Legacy tool: apakah <teks>?",
  usage: "apakah <teks>?",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
