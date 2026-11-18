/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for listwarn.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "listwarn.js",
  family: "A",
  command: "listwarn",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "listwarn",
  aliases: [],
  category: "restored",
  description: "Restored: listwarn",
  usage: ".listwarn",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
