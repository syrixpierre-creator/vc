const { run } = require('../lib/compat');
const META = {"file":"fun-gantengcek.js","family":"A","command":"cekganteng","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekganteng",
  aliases: ["gantengcek"],
  category: "fun",
  description: "Legacy tool: gantengcek",
  usage: "gantengcek",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
