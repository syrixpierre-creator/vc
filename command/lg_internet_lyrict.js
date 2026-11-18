const { run } = require('../lib/compat');
const META = {"file":"internet-lyrict.js","family":"A","command":"lirik","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "lirik",
  aliases: [],
  category: "internet",
  description: "Legacy tool: lyrics <judul>",
  usage: "lyrics <judul>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
