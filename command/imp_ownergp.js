/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-gp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-gp.js",
  family: "B",
  command: "ownergp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownergp",
  aliases: [],
  category: "restored",
  description: "Restored: owner-gp",
  usage: ".ownergp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
