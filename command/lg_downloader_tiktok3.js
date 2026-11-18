const { run } = require('../lib/compat');
const META = {"file":"downloader-tiktok3.js","family":"A","command":"tiktokdl3","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tiktokdl3",
  aliases: ["tt3"],
  category: "downloader",
  description: "Legacy tool: tiktokdl3 <url>",
  usage: "tiktokdl3 <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
