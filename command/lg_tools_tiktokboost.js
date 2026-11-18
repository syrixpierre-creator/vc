const { run } = require('../lib/compat');
const META = {"file":"tools-tiktokboost.js","family":"A","command":"tiktokboost","perms":{"owner":false,"rowner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "tiktokboost",
  aliases: ["ttboost","boosttiktok"],
  category: "downloader",
  description: "Legacy tool: tiktokboost <url>",
  usage: "tiktokboost <url>",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
