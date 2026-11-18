const { run } = require('../lib/compat');
const META = {"file":"info-liburnasional.js","family":"A","command":"liburnas","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "liburnas",
  aliases: [],
  category: "info",
  description: "Legacy tool: liburnas",
  usage: "liburnas",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
