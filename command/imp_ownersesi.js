/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-sesi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-sesi.js",
  family: "B",
  command: "ownersesi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownersesi",
  aliases: [],
  category: "restored",
  description: "Restored: owner-sesi",
  usage: ".ownersesi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
