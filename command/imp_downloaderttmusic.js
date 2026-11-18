/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-ttmusic.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-ttmusic.js",
  family: "A",
  command: "downloaderttmusic",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderttmusic",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-ttmusic",
  usage: ".downloaderttmusic",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
