/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for awe.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "awe.js",
  family: "B",
  command: "awe",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "awe",
  aliases: [],
  category: "restored",
  description: "Restored: awe",
  usage: ".awe",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
