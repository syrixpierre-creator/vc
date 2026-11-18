/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-aio2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-aio2.js",
  family: "B",
  command: "downloaderaio2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderaio2",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-aio2",
  usage: ".downloaderaio2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
