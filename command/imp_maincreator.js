/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-creator.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-creator.js",
  family: "B",
  command: "maincreator",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "maincreator",
  aliases: [],
  category: "restored",
  description: "Restored: main-creator",
  usage: ".maincreator",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
