const { run } = require('../lib/compat');
const META = {"file":"fun-pickup.js","family":"B","command":"sy","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sy",
  aliases: ["se"],
  category: "fun",
  description: "Hidden fun lines",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
