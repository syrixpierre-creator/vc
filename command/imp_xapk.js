/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for apk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "apk.js",
  family: "B",
  command: "xapk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xapk",
  aliases: [],
  category: "restored",
  description: "Restored: apk",
  usage: ".xapk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
