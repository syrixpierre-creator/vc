/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for download-Xhs.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "download-Xhs.js",
  family: "B",
  command: "downloadxhs",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadxhs",
  aliases: [],
  category: "restored",
  description: "Restored: download-Xhs",
  usage: ".downloadxhs",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
