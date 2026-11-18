const { run } = require('../lib/compat');
const META = {"file":"bratvid.js","family":"A","command":"bratvid","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bratvid",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: bratvid <teks>",
  usage: "bratvid <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
