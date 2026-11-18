const { run } = require('../lib/compat');
const META = {"file":"cek-warn.js","family":"A","command":"cekwarn","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekwarn",
  aliases: [],
  category: "info",
  description: "Legacy tool: cekwarn",
  usage: "cekwarn",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
