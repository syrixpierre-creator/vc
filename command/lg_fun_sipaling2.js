const { run } = require('../lib/compat');
const META = {"file":"fun-sipaling2.js","family":"A","command":"sipaling","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sipaling",
  aliases: [],
  category: "fun",
  description: "Legacy tool: sipaling",
  usage: "sipaling",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
