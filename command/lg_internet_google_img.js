const { run } = require('../lib/compat');
const META = {"file":"internet-google-img.js","family":"A","command":"googleimg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "googleimg",
  aliases: [],
  category: "search",
  description: "Legacy tool: googleimg",
  usage: "googleimg",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
