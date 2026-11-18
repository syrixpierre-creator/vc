const { run } = require('../lib/compat');
const META = {"file":"toai.js","family":"A","command":"aisticker","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "aisticker",
  aliases: ["stickerai","sai"],
  category: "sticker",
  description: "Legacy tool: toaisticker",
  usage: "toaisticker",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
