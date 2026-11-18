const { run } = require('../lib/compat');
const META = {"file":"maker-fakexnxx.js","family":"A","command":"fakexnxx","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "fakexnxx",
  aliases: [],
  category: "maker",
  description: "Legacy tool: fakexnxx <nama> | <quote>",
  usage: "fakexnxx <nama> | <quote>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
