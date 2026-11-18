const { run } = require('../lib/compat');
const META = {"file":"maker-sertifitolol.js","family":"A","command":"sertiftolol","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sertiftolol",
  aliases: ["sertifikattolol"],
  category: "maker",
  description: "Legacy tool: sertiftolol <nama>",
  usage: "sertiftolol <nama>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
