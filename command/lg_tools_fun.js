const { run } = require('../lib/compat');
const META = {"file":"tools-fun.js","family":"B","command":"masom","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "masom",
  aliases: ["line","truthquestion","pickupline","char","repeat","rp","rpm","send","rm","rmore","readm"],
  category: "fun",
  description: "😂 Get a random joke",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
