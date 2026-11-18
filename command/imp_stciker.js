/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stciker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stciker.js",
  family: "B",
  command: "stciker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "stciker",
  aliases: [],
  category: "restored",
  description: "Restored: stciker",
  usage: ".stciker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
