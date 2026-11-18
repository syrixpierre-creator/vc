/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_setowner.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_setowner.js",
  family: "A",
  command: "newsetowner",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsetowner",
  aliases: [],
  category: "restored",
  description: "Restored: new_setowner",
  usage: ".newsetowner",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
