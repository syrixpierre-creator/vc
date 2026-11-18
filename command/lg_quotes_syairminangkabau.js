const { run } = require('../lib/compat');
const META = {"file":"quotes-syairminangkabau.js","family":"A","command":"syairminangkabau","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "syairminangkabau",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: syairminangkabau",
  usage: "syairminangkabau",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
