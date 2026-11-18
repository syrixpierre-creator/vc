/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for yt-seaech.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "yt-seaech.js",
  family: "B",
  command: "ytseaech",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ytseaech",
  aliases: [],
  category: "restored",
  description: "Restored: yt-seaech",
  usage: ".ytseaech",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
