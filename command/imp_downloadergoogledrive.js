/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-googledrive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-googledrive.js",
  family: "B",
  command: "downloadergoogledrive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadergoogledrive",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-googledrive",
  usage: ".downloadergoogledrive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
