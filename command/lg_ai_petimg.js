const { run } = require('../lib/compat');
const META = {"file":"ai-petimg.js","family":"A","command":"petimg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "petimg",
  aliases: ["petvid"],
  category: "ai",
  description: "Legacy tool: petimg",
  usage: "petimg",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
