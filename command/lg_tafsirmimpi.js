const { run } = require('../lib/compat');
const META = {"file":"tafsirmimpi.js","family":"A","command":"mimpi2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "mimpi2",
  aliases: [],
  category: "fun",
  description: "Legacy tool: mimpi2 <kata>",
  usage: "mimpi2 <kata>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
