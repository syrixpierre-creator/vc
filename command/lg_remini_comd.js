const { run } = require('../lib/compat');
const META = {"file":"Remini-comd.js","family":"B","command":"hd","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "hd",
  aliases: ["clearimg","cartoon","toon","tocartoon"],
  category: "tools",
  description: "Enhance/clear image quality using Remini AI",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
