const { run } = require('../lib/compat');
const META = {"file":"New.js","family":"B","command":"history","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "history2",
  aliases: [],
  category: "group",
  description: "Toggle group history sharing",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
