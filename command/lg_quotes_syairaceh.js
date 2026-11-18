const { run } = require('../lib/compat');
const META = {"file":"quotes-syairaceh.js","family":"A","command":"syairaceh","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "syairaceh",
  aliases: [],
  category: "quotes",
  description: "Legacy tool: syairaceh",
  usage: "syairaceh",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
