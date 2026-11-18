const { run } = require('../lib/compat');
const META = {"file":"tts-ondoku.js","family":"A","command":"ondoku","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ondoku",
  aliases: ["voiceondoku"],
  category: "tools",
  description: "Legacy tool: ondoku <voice|text>",
  usage: "ondoku <voice|text>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
