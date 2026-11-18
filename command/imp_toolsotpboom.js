/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-otpboom.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-otpboom.js",
  family: "B",
  command: "toolsotpboom",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsotpboom",
  aliases: [],
  category: "restored",
  description: "Restored: tools-otpboom",
  usage: ".toolsotpboom",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
