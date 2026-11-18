/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_devil.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_devil.js",
  family: "A",
  command: "newdevil",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newdevil",
  aliases: [],
  category: "restored",
  description: "Restored: new_devil",
  usage: ".newdevil",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
