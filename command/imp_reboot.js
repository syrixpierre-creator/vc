/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for reboot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "reboot.js",
  family: "A",
  command: "reboot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "reboot",
  aliases: [],
  category: "restored",
  description: "Restored: reboot",
  usage: ".reboot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
