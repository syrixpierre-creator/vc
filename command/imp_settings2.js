/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for settings2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "settings2.js",
  family: "B",
  command: "settings2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "settings2",
  aliases: [],
  category: "restored",
  description: "Restored: settings2",
  usage: ".settings2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
