/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-addprem.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-addprem.js",
  family: "B",
  command: "owneraddprem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "owneraddprem",
  aliases: [],
  category: "restored",
  description: "Restored: owner-addprem",
  usage: ".owneraddprem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
