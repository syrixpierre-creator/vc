/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-liveig.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-liveig.js",
  family: "B",
  command: "rpgliveig",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgliveig",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-liveig",
  usage: ".rpgliveig",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
