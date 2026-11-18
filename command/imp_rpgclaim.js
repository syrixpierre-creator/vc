/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-claim.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-claim.js",
  family: "B",
  command: "rpgclaim",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgclaim",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-claim",
  usage: ".rpgclaim",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
