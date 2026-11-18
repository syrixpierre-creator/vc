/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for spamotp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "spamotp.js",
  family: "B",
  command: "spamotp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "spamotp",
  aliases: [],
  category: "restored",
  description: "Restored: spamotp",
  usage: ".spamotp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
