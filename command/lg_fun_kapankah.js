const { run } = require('../lib/compat');
const META = {"file":"fun-kapankah.js","family":"A","command":"kapankah","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kapankah",
  aliases: [],
  category: "fun",
  description: "Legacy tool: kapankah <pertanyaan>",
  usage: "kapankah <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
