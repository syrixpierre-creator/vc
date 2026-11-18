/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-iqc2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-iqc2.js",
  family: "A",
  command: "makeriqc2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makeriqc2",
  aliases: [],
  category: "restored",
  description: "Restored: maker-iqc2",
  usage: ".makeriqc2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
