/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-pin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-pin.js",
  family: "B",
  command: "downloaderpin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderpin",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-pin",
  usage: ".downloaderpin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
