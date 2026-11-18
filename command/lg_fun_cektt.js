const { run } = require('../lib/compat');
const META = {"file":"fun-cektt.js","family":"A","command":"cekpentil","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekpentil",
  aliases: ["cektt"],
  category: "fun",
  description: "Legacy tool: cektt *<name>*",
  usage: "cektt *<name>*",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
