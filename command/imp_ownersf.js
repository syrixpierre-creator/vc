/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-sf.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-sf.js",
  family: "B",
  command: "ownersf",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersf",
  aliases: [],
  category: "restored",
  description: "Restored: owner-sf",
  usage: ".ownersf",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
