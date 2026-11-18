const { run } = require('../lib/compat');
const META = {"file":"dl-twitter.js","family":"B","command":"tw","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tw",
  aliases: ["xdl"],
  category: "downloader",
  description: "Download Twitter / X video",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
