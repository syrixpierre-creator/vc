/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-getdb.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-getdb.js",
  family: "B",
  command: "ownergetdb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownergetdb",
  aliases: [],
  category: "restored",
  description: "Restored: owner-getdb",
  usage: ".ownergetdb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
