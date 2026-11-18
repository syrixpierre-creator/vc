const { run } = require('../lib/compat');
const META = {"file":"quotes-gombal.js","family":"A","command":"gombal","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gombal",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: gombal",
  usage: "gombal",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
