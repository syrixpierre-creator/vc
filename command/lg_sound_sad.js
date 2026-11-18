const { run } = require('../lib/compat');
const META = {"file":"sound-sad.js","family":"A","command":"sad","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "sad",
  aliases: [],
  category: "sound",
  description: "Legacy tool: sad <nomor>",
  usage: "sad <nomor>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
