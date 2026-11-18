/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for uhdpaper.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "uhdpaper.js",
  family: "A",
  command: "xuhdpaper",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xuhdpaper",
  aliases: [],
  category: "restored",
  description: "Restored: uhdpaper",
  usage: ".xuhdpaper",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
