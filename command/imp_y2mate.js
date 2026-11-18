/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for y2mate.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "y2mate.js",
  family: "B",
  command: "y2mate",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "y2mate",
  aliases: [],
  category: "restored",
  description: "Restored: y2mate",
  usage: ".y2mate",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
