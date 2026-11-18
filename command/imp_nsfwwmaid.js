/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-wmaid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-wmaid.js",
  family: "B",
  command: "nsfwwmaid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwmaid",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-wmaid",
  usage: ".nsfwwmaid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
