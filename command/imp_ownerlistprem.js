/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-listprem.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-listprem.js",
  family: "B",
  command: "ownerlistprem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerlistprem",
  aliases: [],
  category: "restored",
  description: "Restored: owner-listprem",
  usage: ".ownerlistprem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
