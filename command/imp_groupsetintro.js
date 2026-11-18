/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-setintro.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-setintro.js",
  family: "A",
  command: "groupsetintro",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupsetintro",
  aliases: [],
  category: "restored",
  description: "Restored: group-setintro",
  usage: ".groupsetintro",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
