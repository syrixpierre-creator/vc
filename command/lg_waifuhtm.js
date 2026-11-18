const { run } = require('../lib/compat');
const META = {"file":"waifuhtm.js","family":"A","command":"waifuhtm","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "waifuhtm",
  aliases: ["waifufilterlist"],
  category: "tools",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
