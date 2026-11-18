/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-gdrive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-gdrive.js",
  family: "B",
  command: "downloadergdrive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadergdrive",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-gdrive",
  usage: ".downloadergdrive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
