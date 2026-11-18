const { run } = require('../lib/compat');
const META = {"file":"dl-play.js","family":"B","command":"play2","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "play2",
  aliases: ["song2","music"],
  category: "downloader",
  description: "Download YouTube audio via play",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
