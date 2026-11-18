const { run } = require('../lib/compat');
const META = {"file":"fun-cekkhodam.js","family":"A","command":"kodam","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kodam",
  aliases: ["khodam"],
  category: "fun",
  description: "Legacy tool: cekkhodam",
  usage: "cekkhodam",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
