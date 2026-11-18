/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for soundmeme.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "soundmeme.js",
  family: "B",
  command: "xsoundmeme",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xsoundmeme",
  aliases: [],
  category: "restored",
  description: "Restored: soundmeme",
  usage: ".xsoundmeme",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
