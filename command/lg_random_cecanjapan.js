const { run } = require('../lib/compat');
const META = {"file":"random-cecanjapan.js","family":"A","command":"cecanjapan","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cecanjapan",
  aliases: [],
  category: "random",
  description: "Legacy tool: cecanjapan",
  usage: "cecanjapan",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
