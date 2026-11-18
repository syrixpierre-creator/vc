/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakecallandro.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakecallandro.js",
  family: "B",
  command: "makerfakecallandro",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakecallandro",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakecallandro",
  usage: ".makerfakecallandro",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
