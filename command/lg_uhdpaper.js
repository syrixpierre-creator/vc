const { run } = require('../lib/compat');
const META = {"file":"uhdpaper.js","family":"A","command":"uhdpaper","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "uhdpaper",
  aliases: [],
  category: "internet",
  description: "Legacy tool: uhdpaper <query>",
  usage: "uhdpaper <query>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
