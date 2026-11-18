/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pgroup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pgroup.js",
  family: "B",
  command: "pgroup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pgroup",
  aliases: [],
  category: "restored",
  description: "Restored: pgroup",
  usage: ".pgroup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
