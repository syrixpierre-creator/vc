/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_addreply.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_addreply.js",
  family: "B",
  command: "newaddreply",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newaddreply",
  aliases: [],
  category: "restored",
  description: "Restored: new_addreply",
  usage: ".newaddreply",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
