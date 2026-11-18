/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for kudetagc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "kudetagc.js",
  family: "B",
  command: "kudetagc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "kudetagc",
  aliases: [],
  category: "restored",
  description: "Restored: kudetagc",
  usage: ".kudetagc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
