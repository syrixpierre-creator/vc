/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-iqc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-iqc.js",
  family: "A",
  command: "makeriqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makeriqc",
  aliases: [],
  category: "restored",
  description: "Restored: maker-iqc",
  usage: ".makeriqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
