const { run } = require('../lib/compat');
const META = {"file":"random-cecanvietnam.js","family":"A","command":"cecanvietnam","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cecanvietnam",
  aliases: [],
  category: "random",
  description: "Legacy tool: cecanvietnam",
  usage: "cecanvietnam",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
