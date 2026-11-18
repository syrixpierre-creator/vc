/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for hmod.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "hmod.js",
  family: "A",
  command: "hmod",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "hmod",
  aliases: [],
  category: "restored",
  description: "Restored: hmod",
  usage: ".hmod",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
