/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Group-ammode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Group-ammode.js",
  family: "A",
  command: "groupammode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupammode",
  aliases: [],
  category: "restored",
  description: "Restored: Group-ammode",
  usage: ".groupammode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
