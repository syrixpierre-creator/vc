/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-pixhost.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-pixhost.js",
  family: "B",
  command: "upixhost",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "upixhost",
  aliases: [],
  category: "restored",
  description: "Restored: u-pixhost",
  usage: ".upixhost",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
