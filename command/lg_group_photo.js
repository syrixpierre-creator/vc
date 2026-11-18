const { run } = require('../lib/compat');
const META = {"file":"group-photo.js","family":"B","command":"gcpp","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gcpp",
  aliases: ["setgcpp","setgcpic"],
  category: "group",
  description: "Set Group Profile Picture",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
