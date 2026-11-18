/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-uguuse.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-uguuse.js",
  family: "B",
  command: "uuguuse",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "uuguuse",
  aliases: [],
  category: "restored",
  description: "Restored: u-uguuse",
  usage: ".uuguuse",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
