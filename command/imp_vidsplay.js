/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for vidsplay.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "vidsplay.js",
  family: "A",
  command: "vidsplay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "vidsplay",
  aliases: [],
  category: "restored",
  description: "Restored: vidsplay",
  usage: ".vidsplay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
