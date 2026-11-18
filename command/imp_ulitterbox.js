/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-litterbox.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-litterbox.js",
  family: "B",
  command: "ulitterbox",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ulitterbox",
  aliases: [],
  category: "restored",
  description: "Restored: u-litterbox",
  usage: ".ulitterbox",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
