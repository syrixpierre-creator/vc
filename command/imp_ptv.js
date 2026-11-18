/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ptv.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ptv.js",
  family: "B",
  command: "ptv",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ptv",
  aliases: [],
  category: "restored",
  description: "Restored: ptv",
  usage: ".ptv",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
