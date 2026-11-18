const { run } = require('../lib/compat');
const META = {"file":"legacy_src_compliment.js","family":"B","command":"flatter","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "flatter",
  aliases: ["good","imawesome","awesome","loveme"],
  category: "fun",
  description: "Send a random compliment to someone",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
