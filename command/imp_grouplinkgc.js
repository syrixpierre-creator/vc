/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-linkgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-linkgc.js",
  family: "A",
  command: "grouplinkgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouplinkgc",
  aliases: [],
  category: "restored",
  description: "Restored: group-linkgc",
  usage: ".grouplinkgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
