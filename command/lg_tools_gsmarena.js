const { run } = require('../lib/compat');
const META = {"file":"tools-gsmarena.js","family":"A","command":"gsmarena","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gsmarena",
  aliases: ["gsmspek","hpspek"],
  category: "tools",
  description: "Legacy tool: gsmarena <nama hp>",
  usage: "gsmarena <nama hp>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
