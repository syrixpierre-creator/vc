const { run } = require('../lib/compat');
const META = {"file":"info-totaluser.js","family":"A","command":"pengguna","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "pengguna",
  aliases: ["totaluser"],
  category: "info",
  description: "Legacy tool: totaluser",
  usage: "totaluser",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
