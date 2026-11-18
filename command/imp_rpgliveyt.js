/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-liveyt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-liveyt.js",
  family: "B",
  command: "rpgliveyt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgliveyt",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-liveyt",
  usage: ".rpgliveyt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
