const { run } = require('../lib/compat');
const META = {"file":"ai-realtime.js","family":"A","command":"airealtime","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "airealtime",
  aliases: [],
  category: "ai",
  description: "Legacy tool: airealtime <pertanyaan>",
  usage: "airealtime <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
