const { run } = require('../lib/compat');
const META = {"file":"tools-hdvid.js","family":"A","command":"hdvideo","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hdvideo",
  aliases: ["unblurvideo","vhd"],
  category: "tools",
  description: "Legacy tool: hdvideo",
  usage: "hdvideo",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
