const { run } = require('../lib/compat');
const META = {"file":"group-gdesc.js","family":"B","command":"updategdesc","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "updategdesc",
  aliases: ["upgdesc","gdesc"],
  category: "group",
  description: "Change the group description.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
