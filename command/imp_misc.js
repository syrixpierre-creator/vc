/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for misc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "misc.js",
  family: "B",
  command: "misc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "misc",
  aliases: [],
  category: "restored",
  description: "Restored: misc",
  usage: ".misc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
