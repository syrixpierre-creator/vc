/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for download-yt5so.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "download-yt5so.js",
  family: "B",
  command: "downloadyt5so",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadyt5so",
  aliases: [],
  category: "restored",
  description: "Restored: download-yt5so",
  usage: ".downloadyt5so",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
