const { run } = require('../lib/compat');
const META = {"file":"giftsticker.js","family":"A","command":"gifsticker","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "gifsticker",
  aliases: [],
  category: "sticker",
  description: "Legacy tool: gifsticker <query>,<jumlah>",
  usage: "gifsticker <query>,<jumlah>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
