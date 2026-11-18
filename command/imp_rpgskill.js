/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-skill.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-skill.js",
  family: "B",
  command: "rpgskill",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgskill",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-skill",
  usage: ".rpgskill",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
