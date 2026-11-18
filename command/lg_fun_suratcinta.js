const { run } = require('../lib/compat');
const META = {"file":"fun-suratcinta.js","family":"A","command":"suratcinta","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "suratcinta",
  aliases: [],
  category: "fun",
  description: "Legacy tool: suratcinta <nama>",
  usage: "suratcinta <nama>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
