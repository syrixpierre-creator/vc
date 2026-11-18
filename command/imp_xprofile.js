/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for profile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "profile.js",
  family: "B",
  command: "xprofile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xprofile",
  aliases: [],
  category: "restored",
  description: "Restored: profile",
  usage: ".xprofile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
