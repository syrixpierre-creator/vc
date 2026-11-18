/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_delreply.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_delreply.js",
  family: "A",
  command: "newdelreply",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdelreply",
  aliases: [],
  category: "restored",
  description: "Restored: new_delreply",
  usage: ".newdelreply",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
