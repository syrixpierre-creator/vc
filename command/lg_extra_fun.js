const { run } = require('../lib/compat');
const META = {"file":"extra-fun.js","family":"B","command":"compatibility","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "compatibility2",
  aliases: ["friend","fcheck","aura","lovetest","emoji"],
  category: "fun",
  description: "Calculate the compatibility score between two users.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
