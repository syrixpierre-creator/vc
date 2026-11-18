const { run } = require('../lib/compat');
const META = {"file":"dl_sportfy.js","family":"B","command":"spoti","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "spoti",
  aliases: ["spotifyhelp","spotihelp"],
  category: "downloader",
  description: "Download songs from Spotify",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
