const { run } = require('../lib/compat');
const META = {"file":"animequotes.js","family":"A","command":"animequotes","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "animequotes",
  aliases: [],
  category: "anime",
  description: "Legacy tool: animequotes",
  usage: "animequotes",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
