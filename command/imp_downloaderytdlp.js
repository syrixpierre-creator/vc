/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-ytdlp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-ytdlp.js",
  family: "B",
  command: "downloaderytdlp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderytdlp",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-ytdlp",
  usage: ".downloaderytdlp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
