const { run } = require('../lib/compat');
const META = {"file":"sticker-bratcolor.js","family":"A","command":"brcolor","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "brcolor",
  aliases: ["bratcolor"],
  category: "sticker",
  description: "Legacy tool: bratcolor <teks>|<warna>",
  usage: "bratcolor <teks>|<warna>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
