/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-sfp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-sfp.js",
  family: "B",
  command: "ownersfp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersfp",
  aliases: [],
  category: "restored",
  description: "Restored: owner-sfp",
  usage: ".ownersfp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
