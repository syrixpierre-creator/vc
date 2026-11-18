const { run } = require('../lib/compat');
const META = {"file":"ttsai.js","family":"A","command":"ttsai","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ttsai",
  aliases: [],
  category: "tools",
  description: "Legacy tool: ttsai <model/random/list> | <teks>",
  usage: "ttsai <model/random/list> | <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
