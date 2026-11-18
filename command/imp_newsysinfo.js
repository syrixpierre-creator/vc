/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_sysinfo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_sysinfo.js",
  family: "B",
  command: "newsysinfo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newsysinfo",
  aliases: [],
  category: "restored",
  description: "Restored: new_sysinfo",
  usage: ".newsysinfo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
