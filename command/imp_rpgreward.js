/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-reward.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-reward.js",
  family: "B",
  command: "rpgreward",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgreward",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-reward",
  usage: ".rpgreward",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
