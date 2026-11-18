/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-laporown.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-laporown.js",
  family: "A",
  command: "infolaporown",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "infolaporown",
  aliases: [],
  category: "restored",
  description: "Restored: info-laporown",
  usage: ".infolaporown",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
