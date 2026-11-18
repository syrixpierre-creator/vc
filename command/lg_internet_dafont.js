const { run } = require('../lib/compat');
const META = {"file":"internet-dafont.js","family":"A","command":"dafont","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "dafont",
  aliases: [],
  category: "internet",
  description: "Legacy tool: dafont <nama>",
  usage: "dafont <nama>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
