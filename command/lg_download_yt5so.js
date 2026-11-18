const { run } = require('../lib/compat');
const META = {"file":"download-yt5so.js","family":"A","command":"yt5so","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "yt5so",
  aliases: [],
  category: "downloader",
  description: "Legacy tool: yt5so <Url Ig/Facebook>",
  usage: "yt5so <Url Ig/Facebook>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
