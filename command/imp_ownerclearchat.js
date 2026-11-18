/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-clearchat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-clearchat.js",
  family: "B",
  command: "ownerclearchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerclearchat",
  aliases: [],
  category: "restored",
  description: "Restored: owner-clearchat",
  usage: ".ownerclearchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
