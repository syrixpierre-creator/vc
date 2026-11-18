/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-add.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-add.js",
  family: "B",
  command: "owneradd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "owneradd",
  aliases: [],
  category: "restored",
  description: "Restored: owner-add",
  usage: ".owneradd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
