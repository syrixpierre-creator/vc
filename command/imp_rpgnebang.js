/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-nebang.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-nebang.js",
  family: "B",
  command: "rpgnebang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgnebang",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-nebang",
  usage: ".rpgnebang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
