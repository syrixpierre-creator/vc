/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bratvid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bratvid.js",
  family: "A",
  command: "xbratvid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbratvid",
  aliases: [],
  category: "restored",
  description: "Restored: bratvid",
  usage: ".xbratvid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
