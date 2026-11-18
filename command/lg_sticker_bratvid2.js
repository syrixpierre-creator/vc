const { run } = require('../lib/compat');
const META = {"file":"sticker-bratvid2.js","family":"A","command":"bratvid2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bratvid2",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: bratvid2 <text>",
  usage: "bratvid2 <text>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
