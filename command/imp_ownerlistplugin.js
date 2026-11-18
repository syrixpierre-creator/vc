/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-listplugin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-listplugin.js",
  family: "B",
  command: "ownerlistplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerlistplugin",
  aliases: [],
  category: "restored",
  description: "Restored: owner-listplugin",
  usage: ".ownerlistplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
