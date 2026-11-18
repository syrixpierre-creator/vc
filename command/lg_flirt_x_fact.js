const { run } = require('../lib/compat');
const META = {"file":"flirt x fact.js","family":"B","command":"pickup","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pickup2",
  aliases: ["romance","didyouknow"],
  category: "fun",
  description: "Get random flirty pickup lines",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
