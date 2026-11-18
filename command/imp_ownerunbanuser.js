/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-unbanuser.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-unbanuser.js",
  family: "B",
  command: "ownerunbanuser",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerunbanuser",
  aliases: [],
  category: "restored",
  description: "Restored: owner-unbanuser",
  usage: ".ownerunbanuser",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
