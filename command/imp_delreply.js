/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for delreply.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "delreply.js",
  family: "B",
  command: "delreply",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "delreply",
  aliases: [],
  category: "restored",
  description: "Restored: delreply",
  usage: ".delreply",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
