/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-liburnasional.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-liburnasional.js",
  family: "A",
  command: "infoliburnasional",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infoliburnasional",
  aliases: [],
  category: "restored",
  description: "Restored: info-liburnasional",
  usage: ".infoliburnasional",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
