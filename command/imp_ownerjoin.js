/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-join.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-join.js",
  family: "B",
  command: "ownerjoin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerjoin",
  aliases: [],
  category: "restored",
  description: "Restored: owner-join",
  usage: ".ownerjoin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
