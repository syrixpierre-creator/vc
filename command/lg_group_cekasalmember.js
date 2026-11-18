const { run } = require('../lib/compat');
const META = {"file":"group-cekasalmember.js","family":"A","command":"cekasalmember","perms":{"owner":false,"rowner":false,"group":true,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cekasalmember",
  aliases: [],
  category: "group",
  description: "Legacy tool: cekasalmember",
  usage: "cekasalmember",
  groupOnly: true,
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
