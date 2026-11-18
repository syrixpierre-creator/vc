/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-pixelglitch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-pixelglitch.js",
  family: "B",
  command: "makerpixelglitch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerpixelglitch",
  aliases: [],
  category: "restored",
  description: "Restored: maker-pixelglitch",
  usage: ".makerpixelglitch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
