/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-addowner.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-addowner.js",
  family: "B",
  command: "owneraddowner",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "owneraddowner",
  aliases: [],
  category: "restored",
  description: "Restored: owner-addowner",
  usage: ".owneraddowner",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
