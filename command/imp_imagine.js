/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for imagine.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "imagine.js",
  family: "A",
  command: "imagine",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imagine",
  aliases: [],
  category: "restored",
  description: "Restored: imagine",
  usage: ".imagine",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
