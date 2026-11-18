const { run } = require('../lib/compat');
const META = {"file":"downloader-igaudio.js","family":"A","command":"instaaudio","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "instaaudio",
  aliases: ["igaudio","inastagramaudio"],
  category: "downloader",
  description: "Legacy tool: instaaudio",
  usage: "instaaudio",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
