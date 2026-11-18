const { run } = require('../lib/compat');
const META = {"file":"sticker-animebrat.js","family":"A","command":"animebrat","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "animebrat",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: animebrat <teks>",
  usage: "animebrat <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
