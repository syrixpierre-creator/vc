/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pincode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pincode.js",
  family: "A",
  command: "pincode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pincode",
  aliases: [],
  category: "restored",
  description: "Restored: pincode",
  usage: ".pincode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
