const { run } = require('../lib/compat');
const META = {"file":"fun-seberapagila.js","family":"A","command":"seberapagila","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "seberapagila",
  aliases: [],
  category: "fun",
  description: "Legacy tool: seberapagila <nama opsional>",
  usage: "seberapagila <nama opsional>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
