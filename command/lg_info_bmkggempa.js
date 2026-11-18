const { run } = require('../lib/compat');
const META = {"file":"info-bmkggempa.js","family":"A","command":"bmkggempa","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bmkggempa",
  aliases: [],
  category: "info",
  description: "Legacy tool: bmkggempa",
  usage: "bmkggempa",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
