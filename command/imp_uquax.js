/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-quax.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-quax.js",
  family: "B",
  command: "uquax",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "uquax",
  aliases: [],
  category: "restored",
  description: "Restored: u-quax",
  usage: ".uquax",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
