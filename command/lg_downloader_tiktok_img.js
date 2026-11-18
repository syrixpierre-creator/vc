const { run } = require('../lib/compat');
const META = {"file":"downloader-tiktok_img.js","family":"A","command":"ttimg","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "ttimg",
  aliases: ["tiktokimg"],
  category: "downloader",
  description: "Legacy tool: tiktokimg / ttimg <url>",
  usage: "tiktokimg / ttimg <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
