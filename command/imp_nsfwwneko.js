/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-wneko.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-wneko.js",
  family: "B",
  command: "nsfwwneko",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwneko",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-wneko",
  usage: ".nsfwwneko",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
