/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pstatus.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pstatus.js",
  family: "B",
  command: "pstatus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pstatus",
  aliases: [],
  category: "restored",
  description: "Restored: pstatus",
  usage: ".pstatus",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
