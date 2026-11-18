const { run } = require('../lib/compat');
const META = {"file":"yt-video.js","family":"B","command":"vdl","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "vdl",
  aliases: ["vid"],
  category: "media",
  description: "Download high-quality videos from YouTube",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
