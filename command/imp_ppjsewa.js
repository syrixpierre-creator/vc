/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ppjsewa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ppjsewa.js",
  family: "B",
  command: "ppjsewa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ppjsewa",
  aliases: [],
  category: "restored",
  description: "Restored: ppjsewa",
  usage: ".ppjsewa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
