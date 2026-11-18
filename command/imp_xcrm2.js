/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for crm2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "crm2.js",
  family: "B",
  command: "xcrm2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xcrm2",
  aliases: [],
  category: "restored",
  description: "Restored: crm2",
  usage: ".xcrm2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
