/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gdrive.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gdrive.js",
  family: "B",
  command: "xgdrive",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgdrive",
  aliases: [],
  category: "restored",
  description: "Restored: gdrive",
  usage: ".xgdrive",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
