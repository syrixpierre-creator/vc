const { run } = require('../lib/compat');
const META = {"file":"fun-diamakah.js","family":"A","command":"dimanakah","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dimanakah",
  aliases: [],
  category: "fun",
  description: "Legacy tool: dimanakah <pertanyaan>",
  usage: "dimanakah <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
