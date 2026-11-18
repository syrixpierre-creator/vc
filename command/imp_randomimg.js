/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for random-img.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "random-img.js",
  family: "B",
  command: "randomimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "randomimg",
  aliases: [],
  category: "restored",
  description: "Restored: random-img",
  usage: ".randomimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
