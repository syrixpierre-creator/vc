/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-banuser.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-banuser.js",
  family: "B",
  command: "ownerbanuser",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerbanuser",
  aliases: [],
  category: "restored",
  description: "Restored: owner-banuser",
  usage: ".ownerbanuser",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
