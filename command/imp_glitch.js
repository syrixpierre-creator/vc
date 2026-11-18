/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for glitch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "glitch.js",
  family: "B",
  command: "glitch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "glitch",
  aliases: [],
  category: "restored",
  description: "Restored: glitch",
  usage: ".glitch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
