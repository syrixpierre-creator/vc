const { run } = require('../lib/compat');
const META = {"file":"image.js","family":"B","command":"getimg","perms":{"owner":false,"group":false,"admin":false,"botAdmin":false,"private":false}};

module.exports = {
  command: "getimg",
  aliases: ["imgdl","photo","wall","wp","stickertoimg","s2i"],
  category: "downloader",
  description: "Download images from Google",
  usage: "",
  handler: (sock, message, args, ctx) => run(META, sock, message, args, ctx)
};
