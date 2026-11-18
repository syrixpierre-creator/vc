/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for runcrm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "runcrm.js",
  family: "B",
  command: "xruncrm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xruncrm",
  aliases: [],
  category: "restored",
  description: "Restored: runcrm",
  usage: ".xruncrm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
