const { run } = require('../lib/compat');
const META = {"file":"quotes-ngasal.js","family":"A","command":"ngasal","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ngasal",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: ngasal",
  usage: "ngasal",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
