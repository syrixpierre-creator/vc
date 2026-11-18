const { run } = require('../lib/compat');
const META = {"file":"xp-register.js","family":"A","command":"daftar","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "daftar",
  aliases: ["verify"],
  category: "main",
  description: "Legacy tool: daftar nama,umur",
  usage: "daftar nama,umur",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
