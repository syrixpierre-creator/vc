const { run } = require('../lib/compat');
const META = {"file":"legacy_src_mention.js","family":"B","command":"setmentionreply","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "setmentionreply",
  aliases: [],
  category: "tools",
  description: "Enable/disable mention reply feature",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
