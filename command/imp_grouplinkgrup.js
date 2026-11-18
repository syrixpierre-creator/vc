/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-linkgrup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-linkgrup.js",
  family: "A",
  command: "grouplinkgrup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "grouplinkgrup",
  aliases: [],
  category: "restored",
  description: "Restored: group-linkgrup",
  usage: ".grouplinkgrup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
