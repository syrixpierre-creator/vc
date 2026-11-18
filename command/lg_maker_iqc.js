const { run } = require('../lib/compat');
const META = {"file":"maker-iqc.js","family":"A","command":"fakeiphonechat","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "fakeiphonechat",
  aliases: [],
  category: "maker",
  description: "Legacy tool: iqc",
  usage: "iqc",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
