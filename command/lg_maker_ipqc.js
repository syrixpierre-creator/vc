const { run } = require('../lib/compat');
const META = {"file":"maker-ipqc.js","family":"A","command":"iqc","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "iqc",
  aliases: [],
  category: "maker",
  description: "Legacy tool: iqc <pesan>",
  usage: "iqc <pesan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
