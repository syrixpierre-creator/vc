const { run } = require('../lib/compat');
const META = {"file":"ai-askai.js","family":"A","command":"askai","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "askai",
  aliases: ["listmodel"],
  category: "ai",
  description: "Legacy tool: askai <model> <pertanyaan>",
  usage: "askai <model> <pertanyaan>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
