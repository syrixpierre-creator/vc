const { run } = require('../lib/compat');
const META = {"file":"tool-vfc.js","family":"B","command":"savecontact","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "savecontact",
  aliases: ["vcf","scontact","savecontacts"],
  category: "tools",
  description: "gc vcard",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
