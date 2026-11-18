const { run } = require('../lib/compat');
const META = {"file":"ai-quilbot.js","family":"A","command":"quillbot","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "quillbot",
  aliases: [],
  category: "ai",
  description: "Legacy tool: quillbot",
  usage: "quillbot",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
