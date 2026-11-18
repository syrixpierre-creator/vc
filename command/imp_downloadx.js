/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for download-X.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "download-X.js",
  family: "B",
  command: "downloadx",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadx",
  aliases: [],
  category: "restored",
  description: "Restored: download-X",
  usage: ".downloadx",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
