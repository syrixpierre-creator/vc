/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ytpost.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ytpost.js",
  family: "B",
  command: "xytpost",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xytpost",
  aliases: [],
  category: "restored",
  description: "Restored: ytpost",
  usage: ".xytpost",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
