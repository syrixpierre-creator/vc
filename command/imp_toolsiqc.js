/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-iqc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-iqc.js",
  family: "B",
  command: "toolsiqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsiqc",
  aliases: [],
  category: "restored",
  description: "Restored: tools-iqc",
  usage: ".toolsiqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
