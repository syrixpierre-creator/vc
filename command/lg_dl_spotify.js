const { run } = require('../lib/compat');
const META = {"file":"dl-spotify.js","family":"B","command":"spot","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "spot",
  aliases: ["spdl"],
  category: "downloader",
  description: "Download Spotify song",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
