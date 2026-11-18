const { run } = require('../lib/compat');
const META = {"file":"soundmeme.js","family":"A","command":"soundmeme","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "soundmeme",
  aliases: [],
  category: "sound",
  description: "Legacy tool: soundmeme",
  usage: "soundmeme",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
