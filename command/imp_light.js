/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for light.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "light.js",
  family: "B",
  command: "light",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "light",
  aliases: [],
  category: "restored",
  description: "Restored: light",
  usage: ".light",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
