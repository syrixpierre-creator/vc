const { run } = require('../lib/compat');
const META = {"file":"kalkulator-mbg.js","family":"A","command":"kalkulatormbg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "kalkulatormbg",
  aliases: ["kkmbg"],
  category: "tools",
  description: "Legacy tool: kalkulatormbg <jumlah_uang>",
  usage: "kalkulatormbg <jumlah_uang>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
