/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for brat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "brat.js",
  family: "B",
  command: "xbrat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbrat",
  aliases: [],
  category: "restored",
  description: "Restored: brat",
  usage: ".xbrat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
