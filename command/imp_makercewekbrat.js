/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-cewekbrat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-cewekbrat.js",
  family: "A",
  command: "makercewekbrat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makercewekbrat",
  aliases: [],
  category: "restored",
  description: "Restored: maker-cewekbrat",
  usage: ".makercewekbrat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
