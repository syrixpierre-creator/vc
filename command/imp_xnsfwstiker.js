/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfwstiker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfwstiker.js",
  family: "B",
  command: "xnsfwstiker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xnsfwstiker",
  aliases: [],
  category: "restored",
  description: "Restored: nsfwstiker",
  usage: ".xnsfwstiker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
