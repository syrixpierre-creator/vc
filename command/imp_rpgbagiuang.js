/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-bagiuang.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-bagiuang.js",
  family: "B",
  command: "rpgbagiuang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbagiuang",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-bagiuang",
  usage: ".rpgbagiuang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
