/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-woral.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-woral.js",
  family: "B",
  command: "nsfwworal",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwworal",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-woral",
  usage: ".nsfwworal",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
