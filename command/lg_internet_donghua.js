const { run } = require('../lib/compat');
const META = {"file":"internet-donghua.js","family":"A","command":"donghua","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "donghua",
  aliases: ["donghuadetail"],
  category: "internet",
  description: "Legacy tool: donghua",
  usage: "donghua",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
