const { run } = require('../lib/compat');
const META = {"file":"internet-wikipedia.js","family":"A","command":"wikiid","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "wikiid",
  aliases: [],
  category: "internet",
  description: "Legacy tool: wiki",
  usage: "wiki",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
