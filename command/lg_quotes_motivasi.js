const { run } = require('../lib/compat');
const META = {"file":"quotes-motivasi.js","family":"A","command":"motivasi","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "motivasi",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: motivasi",
  usage: "motivasi",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
