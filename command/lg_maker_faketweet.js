const { run } = require('../lib/compat');
const META = {"file":"maker-faketweet.js","family":"A","command":"faketweet","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "faketweet",
  aliases: [],
  category: "maker",
  description: "Legacy tool: faketweet <name>|<username>|<comment>|<verified>",
  usage: "faketweet <name>|<username>|<comment>|<verified>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
