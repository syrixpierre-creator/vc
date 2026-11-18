/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-cekidgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-cekidgc.js",
  family: "B",
  command: "ownercekidgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownercekidgc",
  aliases: [],
  category: "restored",
  description: "Restored: owner-cekidgc",
  usage: ".ownercekidgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
