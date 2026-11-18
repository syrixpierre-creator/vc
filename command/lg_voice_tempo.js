const { run } = require('../lib/compat');
const META = {"file":"voice-tempo.js","family":"A","command":"tempo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tempo",
  aliases: [],
  category: "voice",
  description: "Legacy tool: tempo <0.5-2.5>",
  usage: "tempo <0.5-2.5>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
