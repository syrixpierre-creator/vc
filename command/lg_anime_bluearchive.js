const { run } = require('../lib/compat');
const META = {"file":"anime-bluearchive.js","family":"A","command":"bluearchive","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "bluearchive",
  aliases: ["baimg","blue-archive"],
  category: "anime",
  description: "Legacy tool: bluearchive",
  usage: "bluearchive",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
