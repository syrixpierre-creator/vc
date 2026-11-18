const { run } = require('../lib/compat');
const META = {"file":"tools-sharetext.js","family":"A","command":"shareteks","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "shareteks",
  aliases: ["bagiteks"],
  category: "tools",
  description: "Legacy tool: shareteks teks",
  usage: "shareteks teks",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
