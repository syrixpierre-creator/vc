const { run } = require('../lib/compat');
const META = {"file":"dl-apk.js","family":"B","command":"apk","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "apk",
  aliases: [],
  category: "downloader",
  description: "Download APK from Aptoide",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
