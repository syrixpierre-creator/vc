/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gpp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gpp.js",
  family: "B",
  command: "gpp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gpp",
  aliases: [],
  category: "restored",
  description: "Restored: gpp",
  usage: ".gpp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
