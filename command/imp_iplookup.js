/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for iplookup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "iplookup.js",
  family: "A",
  command: "iplookup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "iplookup",
  aliases: [],
  category: "restored",
  description: "Restored: iplookup",
  usage: ".iplookup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
