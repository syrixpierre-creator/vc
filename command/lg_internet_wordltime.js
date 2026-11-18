const { run } = require('../lib/compat');
const META = {"file":"internet-wordltime.js","family":"A","command":"worldtime","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "worldtime",
  aliases: ["waktuglobal"],
  category: "internet",
  description: "Legacy tool: worldtime",
  usage: "worldtime",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
