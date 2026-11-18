const { run } = require('../lib/compat');
const META = {"file":"sticker-ryoyamada.js","family":"A","command":"ryo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ryo",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: ryo",
  usage: "ryo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
