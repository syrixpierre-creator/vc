/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sfile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sfile.js",
  family: "A",
  command: "sfile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sfile",
  aliases: [],
  category: "restored",
  description: "Restored: sfile",
  usage: ".sfile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
