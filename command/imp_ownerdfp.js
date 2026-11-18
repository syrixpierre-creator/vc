/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-dfp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-dfp.js",
  family: "B",
  command: "ownerdfp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerdfp",
  aliases: [],
  category: "restored",
  description: "Restored: owner-dfp",
  usage: ".ownerdfp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
