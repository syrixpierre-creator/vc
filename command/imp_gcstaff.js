/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gc-staff.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gc-staff.js",
  family: "B",
  command: "gcstaff",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcstaff",
  aliases: [],
  category: "restored",
  description: "Restored: gc-staff",
  usage: ".gcstaff",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
