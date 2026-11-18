const { run } = require('../lib/compat');
const META = {"file":"stalk-roblox.js","family":"A","command":"robloxstalk","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "robloxstalk",
  aliases: [],
  category: "stalk",
  description: "Legacy tool: robloxstalk <username>",
  usage: "robloxstalk <username>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
