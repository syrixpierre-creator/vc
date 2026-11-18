const { run } = require('../lib/compat');
const META = {"file":"ai-t2v.js","family":"A","command":"t2v","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "t2v",
  aliases: ["texttovideo"],
  category: "ai",
  description: "Legacy tool: t2v",
  usage: "t2v",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
