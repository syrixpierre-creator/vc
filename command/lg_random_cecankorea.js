const { run } = require('../lib/compat');
const META = {"file":"random-cecankorea.js","family":"A","command":"cecankorea","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cecankorea",
  aliases: [],
  category: "random",
  description: "Legacy tool: cecankorea",
  usage: "cecankorea",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
