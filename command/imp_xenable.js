/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for enable.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "enable.js",
  family: "B",
  command: "xenable",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xenable",
  aliases: [],
  category: "restored",
  description: "Restored: enable",
  usage: ".xenable",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
