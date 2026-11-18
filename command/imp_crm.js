/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for crm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "crm.js",
  family: "B",
  command: "crm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "crm",
  aliases: [],
  category: "restored",
  description: "Restored: crm",
  usage: ".crm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
