const { run } = require('../lib/compat');
const META = {"file":"ai_sora.js","family":"B","command":"soraai","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "soraai2",
  aliases: [],
  category: "ai",
  description: "Generate AI videos using Sora",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
