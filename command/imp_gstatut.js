/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gstatut.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gstatut.js",
  family: "B",
  command: "gstatut",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gstatut",
  aliases: [],
  category: "restored",
  description: "Restored: gstatut",
  usage: ".gstatut",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
