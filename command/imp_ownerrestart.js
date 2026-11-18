/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-restart.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-restart.js",
  family: "B",
  command: "ownerrestart",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerrestart",
  aliases: [],
  category: "restored",
  description: "Restored: owner-restart",
  usage: ".ownerrestart",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
