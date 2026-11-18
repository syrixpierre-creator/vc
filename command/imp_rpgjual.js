/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-jual.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-jual.js",
  family: "B",
  command: "rpgjual",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgjual",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-jual",
  usage: ".rpgjual",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
