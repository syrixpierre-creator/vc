/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for autosholat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "autosholat.js",
  family: "B",
  command: "autosholat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "autosholat",
  aliases: [],
  category: "restored",
  description: "Restored: autosholat",
  usage: ".autosholat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
