/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-pushkontak.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-pushkontak.js",
  family: "B",
  command: "ownerpushkontak",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerpushkontak",
  aliases: [],
  category: "restored",
  description: "Restored: owner-pushkontak",
  usage: ".ownerpushkontak",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
