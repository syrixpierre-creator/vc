const { run } = require('../lib/compat');
const META = {"file":"sticker-tenor.js","family":"A","command":"tenor","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tenor",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: tenor",
  usage: "tenor",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
