const { run } = require('../lib/compat');
const META = {"file":"ai-editimg.js","family":"A","command":"editimg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "editimg",
  aliases: [],
  category: "ai",
  description: "Legacy tool: editimg <prompt> (reply foto)",
  usage: "editimg <prompt> (reply foto)",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
