const { run } = require('../lib/compat');
const META = {"file":"yta.js","family":"A","command":"audioyt","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "audioyt",
  aliases: [],
  category: "downloader",
  description: "Imported tool",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
