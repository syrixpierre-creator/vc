/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for xp-profile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "xp-profile.js",
  family: "B",
  command: "xpprofile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpprofile",
  aliases: [],
  category: "restored",
  description: "Restored: xp-profile",
  usage: ".xpprofile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
