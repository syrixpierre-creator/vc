const { run } = require('../lib/compat');
const META = {"file":"rch2.js","family":"A","command":"rch2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "rch2",
  aliases: ["reactchannel2","reactch2"],
  category: "tools",
  description: "Legacy tool: rch2",
  usage: "rch2",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
