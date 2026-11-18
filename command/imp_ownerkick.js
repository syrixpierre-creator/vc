/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-kick.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-kick.js",
  family: "B",
  command: "ownerkick",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerkick",
  aliases: [],
  category: "restored",
  description: "Restored: owner-kick",
  usage: ".ownerkick",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
