const { run } = require('../lib/compat');
const META = {"file":"ai-jadikomik.js","family":"A","command":"jadikomik","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "jadikomik",
  aliases: [],
  category: "ai",
  description: "Legacy tool: jadikomik",
  usage: "jadikomik",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
