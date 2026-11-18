/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for syshealth.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "syshealth.js",
  family: "A",
  command: "syshealth",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "syshealth",
  aliases: [],
  category: "restored",
  description: "Restored: syshealth",
  usage: ".syshealth",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
