const { run } = require('../lib/compat');
const META = {"file":"tools-upgh.js","family":"A","command":"uploadgh","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "uploadgh",
  aliases: ["tourlgh","ghupload"],
  category: "tools",
  description: "Legacy tool: uploadgh",
  usage: "uploadgh",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
