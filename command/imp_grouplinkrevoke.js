/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-link-revoke.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-link-revoke.js",
  family: "B",
  command: "grouplinkrevoke",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouplinkrevoke",
  aliases: [],
  category: "restored",
  description: "Restored: group-link-revoke",
  usage: ".grouplinkrevoke",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
