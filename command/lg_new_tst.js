const { run } = require('../lib/compat');
const META = {"file":"new-tst.js","family":"B","command":"music2","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "music2",
  aliases: [],
  category: "downloader",
  description: "Download and stream MP3 from YouTube using high-speed API.",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
