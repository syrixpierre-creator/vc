const { run } = require('../lib/compat');
const META = {"file":"stalk-ff.js","family":"A","command":"ffstalk","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ffstalk",
  aliases: ["freestalk"],
  category: "stalk",
  description: "Legacy tool: ffstalk",
  usage: "ffstalk",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
