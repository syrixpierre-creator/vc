const { run } = require('../lib/compat');
const META = {"file":"fun-benarkah.js","family":"A","command":"benarkah","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "benarkah",
  aliases: [],
  category: "fun",
  description: "Legacy tool: benarkah",
  usage: "benarkah",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
