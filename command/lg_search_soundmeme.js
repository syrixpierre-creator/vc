const { run } = require('../lib/compat');
const META = {"file":"search-soundmeme.js","family":"A","command":"soundmeme2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "soundmeme2",
  aliases: [],
  category: "search",
  description: "Legacy tool: soundmeme-listnama nama",
  usage: "soundmeme-listnama nama",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
