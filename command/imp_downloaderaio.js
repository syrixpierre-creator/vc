/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-aio.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-aio.js",
  family: "A",
  command: "downloaderaio",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderaio",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-aio",
  usage: ".downloaderaio",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
