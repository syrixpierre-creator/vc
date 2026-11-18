const { run } = require('../lib/compat');
const META = {"file":"fun-angka.js","family":"A","command":"angka","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "angka",
  aliases: [],
  category: "fun",
  description: "Legacy tool: angka",
  usage: "angka",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
