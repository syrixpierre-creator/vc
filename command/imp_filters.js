/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for filters.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "filters.js",
  family: "B",
  command: "filters",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "filters",
  aliases: [],
  category: "restored",
  description: "Restored: filters",
  usage: ".filters",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
