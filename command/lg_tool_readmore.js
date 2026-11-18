const { run } = require('../lib/compat');
const META = {"file":"tool-readmore.js","family":"A","command":"spoiler","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "spoiler",
  aliases: ["hidetext","selengkapnya"],
  category: "tools",
  description: "Legacy tool: readmore",
  usage: "readmore",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
