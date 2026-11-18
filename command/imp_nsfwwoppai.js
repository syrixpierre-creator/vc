/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-woppai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-woppai.js",
  family: "B",
  command: "nsfwwoppai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwoppai",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-woppai",
  usage: ".nsfwwoppai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
