/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for play3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "play3.js",
  family: "A",
  command: "xplay3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xplay3",
  aliases: [],
  category: "restored",
  description: "Restored: play3",
  usage: ".xplay3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
