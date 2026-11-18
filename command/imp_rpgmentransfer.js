/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-mentransfer.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-mentransfer.js",
  family: "B",
  command: "rpgmentransfer",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgmentransfer",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-mentransfer",
  usage: ".rpgmentransfer",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
