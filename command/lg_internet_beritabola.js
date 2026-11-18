const { run } = require('../lib/compat');
const META = {"file":"internet-beritabola.js","family":"A","command":"beritabola","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "beritabola",
  aliases: [],
  category: "internet",
  description: "Legacy tool: beritabola",
  usage: "beritabola",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
