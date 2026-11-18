/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for renungan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "renungan.js",
  family: "B",
  command: "xrenungan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xrenungan",
  aliases: [],
  category: "restored",
  description: "Restored: renungan",
  usage: ".xrenungan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
