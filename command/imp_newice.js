/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_ice.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_ice.js",
  family: "A",
  command: "newice",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newice",
  aliases: [],
  category: "restored",
  description: "Restored: new_ice",
  usage: ".newice",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
