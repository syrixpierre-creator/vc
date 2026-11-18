const { run } = require('../lib/compat');
const META = {"file":"fun-pilih.js","family":"A","command":"fakepilih","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "fakepilih",
  aliases: [],
  category: "fun",
  description: "Legacy tool: fakepilih <teks1,teks2>",
  usage: "fakepilih <teks1,teks2>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
