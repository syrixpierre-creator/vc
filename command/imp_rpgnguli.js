/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-nguli.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-nguli.js",
  family: "B",
  command: "rpgnguli",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgnguli",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-nguli",
  usage: ".rpgnguli",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
