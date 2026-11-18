const { run } = require('../lib/compat');
const META = {"file":"internet-Tafsir.js","family":"A","command":"tafsir","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tafsir",
  aliases: [],
  category: "internet",
  description: "Legacy tool: tafsir",
  usage: "tafsir",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
