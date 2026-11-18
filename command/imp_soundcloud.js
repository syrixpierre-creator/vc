/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for soundcloud.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "soundcloud.js",
  family: "B",
  command: "soundcloud",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "soundcloud",
  aliases: [],
  category: "restored",
  description: "Restored: soundcloud",
  usage: ".soundcloud",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
