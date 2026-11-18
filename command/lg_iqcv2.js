const { run } = require('../lib/compat');
const META = {"file":"Iqcv2.js","family":"A","command":"iqcv2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "iqcv2",
  aliases: [],
  category: "tools",
  description: "Legacy tool: iqcv2",
  usage: "iqcv2",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
