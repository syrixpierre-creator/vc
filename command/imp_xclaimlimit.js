/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _claim-limit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_claim-limit.js",
  family: "B",
  command: "xclaimlimit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xclaimlimit",
  aliases: [],
  category: "restored",
  description: "Restored: _claim-limit",
  usage: ".xclaimlimit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
