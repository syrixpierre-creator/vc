/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for banSystem.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "banSystem.js",
  family: "B",
  command: "bansystem",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "bansystem",
  aliases: [],
  category: "restored",
  description: "Restored: banSystem",
  usage: ".bansystem",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
