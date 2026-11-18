/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-play.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-play.js",
  family: "B",
  command: "downloaderplay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderplay",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-play",
  usage: ".downloaderplay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
