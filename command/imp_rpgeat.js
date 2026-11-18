/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-eat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-eat.js",
  family: "B",
  command: "rpgeat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgeat",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-eat",
  usage: ".rpgeat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
