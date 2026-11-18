const { run } = require('../lib/compat');
const META = {"file":"maker-iqc2.js","family":"A","command":"iqc2","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "iqc2",
  aliases: [],
  category: "maker",
  description: "Legacy tool: iqc2 <text>|<chatTime>|<statusTime>",
  usage: "iqc2 <text>|<chatTime>|<statusTime>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
