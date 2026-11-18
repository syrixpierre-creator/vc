const { run } = require('../lib/compat');
const META = {"file":"maker-cewekbrat.js","family":"A","command":"cewekbrat","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "cewekbrat",
  aliases: [],
  category: "maker",
  description: "Legacy tool: cewekbrat <teks>",
  usage: "cewekbrat <teks>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
