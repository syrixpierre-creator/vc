/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-rule34.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-rule34.js",
  family: "B",
  command: "nsfwrule34",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwrule34",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-rule34",
  usage: ".nsfwrule34",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
