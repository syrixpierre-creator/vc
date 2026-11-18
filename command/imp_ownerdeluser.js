/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-deluser.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-deluser.js",
  family: "B",
  command: "ownerdeluser",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerdeluser",
  aliases: [],
  category: "restored",
  description: "Restored: owner-deluser",
  usage: ".ownerdeluser",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
