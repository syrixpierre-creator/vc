const { run } = require('../lib/compat');
const META = {"file":"dl-song.js","family":"B","command":"audio","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "audio",
  aliases: [],
  category: "downloader",
  description: "Download YouTube audio (MP3)",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
