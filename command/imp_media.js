/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for media.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "media.js",
  family: "B",
  command: "media",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "media",
  aliases: [],
  category: "restored",
  description: "Restored: media",
  usage: ".media",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
