const { run } = require('../lib/compat');
const META = {"file":"ai-createimg.js","family":"A","command":"createimg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "createimg",
  aliases: [],
  category: "ai",
  description: "Legacy tool: createimg",
  usage: "createimg",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
