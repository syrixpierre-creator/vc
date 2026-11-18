const { run } = require('../lib/compat');
const META = {"file":"anime-random.js","family":"A","command":"animerandom","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "animerandom",
  aliases: [],
  category: "anime",
  description: "Legacy tool: animerandom",
  usage: "animerandom",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
