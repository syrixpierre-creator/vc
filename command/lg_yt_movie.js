const { run } = require('../lib/compat');
const META = {"file":"yt-movie.js","family":"B","command":"subtitle","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "subtitle",
  aliases: ["sub","srt","subtitledl"],
  category: "downloader",
  description: "Search and download subtitles",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
