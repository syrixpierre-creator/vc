/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for hitamkan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "hitamkan.js",
  family: "B",
  command: "hitamkan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "hitamkan",
  aliases: [],
  category: "restored",
  description: "Restored: hitamkan",
  usage: ".hitamkan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
