const { run } = require('../lib/compat');
const META = {"file":"ktpmaker.js","family":"A","command":"cktp","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cktp",
  aliases: [],
  category: "maker",
  description: "Legacy tool: cktp <data>",
  usage: "cktp <data>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
