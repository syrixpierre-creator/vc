/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for getty.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "getty.js",
  family: "A",
  command: "getty",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "getty",
  aliases: [],
  category: "restored",
  description: "Restored: getty",
  usage: ".getty",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
