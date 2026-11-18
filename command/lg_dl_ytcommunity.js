const { run } = require('../lib/compat');
const META = {"file":"dl-ytcommunity.js","family":"B","command":"ytpost","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ytpost",
  aliases: ["ytcommunity","ytc"],
  category: "downloader",
  description: "Download a YouTube community post",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
