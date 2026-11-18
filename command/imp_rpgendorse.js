/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-endorse.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-endorse.js",
  family: "B",
  command: "rpgendorse",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgendorse",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-endorse",
  usage: ".rpgendorse",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
