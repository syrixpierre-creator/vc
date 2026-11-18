/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-joingc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-joingc.js",
  family: "B",
  command: "ownerjoingc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerjoingc",
  aliases: [],
  category: "restored",
  description: "Restored: owner-joingc",
  usage: ".ownerjoingc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
