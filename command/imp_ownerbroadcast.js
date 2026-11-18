/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-broadcast.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-broadcast.js",
  family: "B",
  command: "ownerbroadcast",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerbroadcast",
  aliases: [],
  category: "restored",
  description: "Restored: owner-broadcast",
  usage: ".ownerbroadcast",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
